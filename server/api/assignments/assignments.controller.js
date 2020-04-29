const moment = require('moment')
const logger = require('../../modules/logger')

const Block = require('../blocks/blocks.model')
const Assignment = require('./assignments.model')
const Student = require('../students/students.model')
const Unavailability = require('../unavailabilities/unavailabilities.model')

const google = require('../../modules/google')

const { generateDummyAssignment } = require('../../modules/dummydata')

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

/**
 * This middleware assumes that the route has a 'assignmentID' parameter.
 * It gets the assignment from this ID and makes it available to all subsequent routes
 * as ctx.state.assignment
 *
 * @param {Koa context} ctx
 */
async function getAssignmentMiddleware (ctx, next) {
  const assignmentID = ctx.params.assignmentID

  let assignment
  try {
    assignment = await Assignment.findOne({
      _id: assignmentID,
      $or: [
        { _student: ctx.state.user._id },
        { shared: true, sharedWith: ctx.state.user.rcs_id }
      ]
    })
      .populate({
        path: '_blocks',
        match: {
          $or: [
            {
              _student: ctx.state.user._id
            },
            {
              shared: true
            }
          ]
        }
      })
      .populate('_student', '_id rcs_id name graduationYear integrations')
      .populate('comments._student', '_id rcs_id name graduationYear')
  } catch (e) {
    logger.error(
      `Error getting assignment ${assignmentID} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.internalServerError(
      'There was an error getting the assignment.'
    )
  }

  // Ensure assignment exists
  if (!assignment) {
    logger.error(
      `Failed to find assignment with ID ${assignmentID} for ${
        ctx.state.user.rcs_id
      }.`
    )
    return ctx.notFound('Could not find assignment.')
  }

  ctx.state.assignment = assignment
  ctx.state.isAssignmentOwner = assignment._student._id.equals(ctx.state.user._id) // Mongoose ID's must use .equals()

  await next()
}

/**
 * Returns a list of all assignments with optional dueOn or dueBy filters.
 * start and end are optional URL query options in YYYY-MM-DD format.
 *
 * GET /assignments
 * @param {Koa context} ctx
 * @returns The array of assignments
 */
async function getAssignments (ctx) {
  let assignments

  try {
    assignments = await ctx.state.user.getUserAssignments(ctx.query)
  } catch (e) {
    logger.error(
      `Failed to send assignments to ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.internalServerError(
      'There was an error getting your assignments.'
    )
  }

  ctx.ok({
    assignments
  })
}

/**
 * Get all of the logged in student's assignments in a given term.
 * The term code is passed in the route params as :termCode
 *
 * @param {Koa context} ctx
 * @returns Array of the term's assignments
 */
async function getTermAssignments (ctx) {
  const { termCode } = ctx.params

  const term = ctx.session.terms.find(term => term.code === termCode)
  if (!term) {
    logger.error(
      `${
        ctx.state.user.rcs_id
      } tried to get assignments for non-existent term ${termCode}`
    )
    return ctx.badRequest(`Failed to find the term ${termCode}!`)
  }

  let assignments
  try {
    assignments = await Assignment.find({
      $and: [
        {
          $or: [
            { _student: ctx.state.user._id },
            { shared: true, sharedWith: ctx.state.user.rcs_id }
          ]
        },
        {
          $or: [
            { termCode },
            {
              dueDate: {
                $gte: term.startDate,
                $lt: term.endDate
              }
            }
          ]
        }
      ]
    })
  } catch (e) {
    logger.error(`Failed to get assignments: ${e}`)
    return ctx.badRequest('There was an error getting the assignments.')
  }

  ctx.ok({
    assignments
  })
}

/**
 * Given an assignment ID, return the assignment only if it belongs to the logged in user.
 *
 * GET /assignments/a/:assignmentID
 * @param {Koa context} ctx
 * @returns The assignment
 */
async function getAssignment (ctx) {
  const assignmentID = ctx.params.assignmentID

  ctx.ok({
    assessment: ctx.state.assignment,
    assignment: ctx.state.assignment
  })
}

async function setAssignmentCollaborators (ctx) {
  if (!ctx.state.assignment.shared) {
    return ctx.badRequest('This assignment isn\'t shared!')
  }

  const { sharedWith } = ctx.request.body
  const existing = ctx.state.assignment.sharedWith

  // Determine students to add
  const newStudents = sharedWith.filter(
    newStudent => !existing.includes(newStudent)
  )

  const course = await ctx.state.user.courseFromCRN(
    ctx.session.currentTerm.code,
    ctx.state.assignment.courseCRN
  )

  if (newStudents.length > 0 && process.env.NODE_ENV === 'production') {
    sgMail.send({
      to: newStudents.map(rcsID => rcsID + '@rpi.edu'),
      from: 'LATE <no-reply@late.work>',
      templateId: 'd-9c74c53a41fe4b868b7b10b241edcbba',
      dynamic_template_data: {
        sharer: ctx.state.user,
        course,
        assignment: ctx.state.assignment,
        assignmentURL:
          process.env.BASE_URL + '/coursework/a/' + ctx.state.assignment._id
      }
    })
  }

  // Determine students to remove
  const removedStudents = existing.filter(
    oldStudent => !sharedWith.includes(oldStudent)
  )

  ctx.state.assignment.sharedWith = sharedWith

  try {
    await ctx.state.assignment.save()
  } catch (e) {
    logger.error(
      `Failed to save collaborators for assignment ${
        ctx.state.assignment._id
      } for student ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.internalServerError('There was an error saving the assignment.')
  }

  logger.info(`${ctx.state.user.identifier} updated collaborators for ${ctx.state.assignment.identifier}`)

  ctx.ok({
    updatedAssessment: ctx.state.assignment,
    updatedAssignment: ctx.state.assignment
  })
}

/**
 * Given an assignment ID, return the assignment only if it belongs to the logged in user.
 *
 * GET /assignments/a/:assignmentID
 * @param {Koa context} ctx
 * @returns The assignment
 */
async function getAssignmentCollaboratorInfo (ctx) {
  if (!ctx.state.assignment.shared) {
    return ctx.badRequest('This assignment is not shared.')
  }

  const assignmentID = ctx.params.assignmentID
  logger.info(
    `Sending ${ctx.state.assignment.identifier} collaborator info to ${
      ctx.state.user.rcs_id
    }`
  )

  // Collect collaborators and their unavailabilities
  const unavailabilities = {}
  const collaborators = await Student.find({
    rcs_id: { $in: ctx.state.assignment.sharedWith }
  })
  for (const collaborator of collaborators) {
    unavailabilities[collaborator.rcs_id] = await Unavailability.find({
      _student: collaborator._id,
      termCode: ctx.session.currentTerm.code
    })
  }

  ctx.ok({
    collaborators,
    unavailabilities
  })
}

/**
 * Create an assignment given the assignment properies in the request body.
 * Request body:
 *  - title, description, dueDate, courseCRN, timEstimate, priority
 *
 * POST /assignments
 * @param {Koa context} ctx
 * @returns The created assignment
 */
async function createAssignment (ctx) {
  const body = ctx.request.body
  const due = moment(body.dueDate)

  // Limit to this semester
  if (
    !due.isBetween(ctx.session.currentTerm.startDate, ctx.session.currentTerm.endDate)
  ) {
    logger.error(
      `${
        ctx.state.user.rcs_id
      } tried to add assignment outside of current semester.`
    )
    return ctx.badRequest(
      'You cannot add an assignment due outisde of this semester.'
    )
  }
  const assignmentData = {
    _student: ctx.state.user,
    title: body.title,
    description: body.description,
    dueDate: due.toDate(),
    courseCRN: body.courseCRN,
    timeEstimate: body.timeEstimate,
    timeRemaining: body.timeEstimate,
    priority: parseInt(body.priority, 10),
    isRecurring: body.isRecurring
  }
  const newAssignment = new Assignment(assignmentData)

  // AUTO assessment-block ALLOCATION
  // const openSchedule = compileWeeklyOpenSchedule(
  //   ctx.session.currentTerm,
  //   ctx.state.user
  // );

  // // Create work blocks of max size 60 minutes (TODO: Make customizable)

  // // Loop through days from now until assignment due date
  // const daysUntilDue = due.diff(new Date(), 'days');
  // const today = moment().day();

  // console.log(daysUntilDue);

  // let minutesLeft = body.timeEstimate * 60;
  // for (let d = 0; d < Math.abs(10); d++) {
  //   if (minutesLeft === 0) break;

  //   const day = (d + today) % 7; // Get day of the week
  //   const openBlocksThatDay = openSchedule.filter(p => p.day === day);

  //   // Loop through open blocks
  //   for (let p of openBlocksThatDay) {
  //     const duration = Math.min(p.duration, 60); // Limit to 60 minutes
  //     const startTime = moment(p.start, 'HH:mm', true).add(d, 'days');
  //     const endTime = moment(startTime).add(duration, 'minutes');

  //     const newBlock = new Block({
  //       _student: ctx.state.user._id,
  //       startTime,
  //       endTime
  //     });
  //     newBlock.save();

  //     newAssignment._blocks.push(newBlock);
  //     minutesLeft -= duration;
  //     if (minutesLeft === 0) break;
  //   }
  // }
  // --------------------------
  const recurringAssignments = []
  try {
    await newAssignment.save()

    if (body.isRecurring) {
      // Create all assignments every week up until end of classes in current semester
      logger.info('Creating recurring assignments...')

      // For other days of the week
      for (const dayIndex of body.recurringDays) {
        const nextFirst = moment(due).add(1, 'day')
        while (nextFirst.day() !== dayIndex) {
          nextFirst.add(1, 'day')
        }

        // For day of week of actual assignment
        while (nextFirst.isBefore(ctx.session.currentTerm.classesEndDate)) {
          const recurringAssignment = new Assignment({
            ...assignmentData,
            _recurringOriginal: newAssignment._id,
            dueDate: nextFirst
          })
          await recurringAssignment.save()
          recurringAssignments.push(recurringAssignment)

          nextFirst.add(1, 'week')
        }
      }
    }
  } catch (e) {
    // mapping schema fields to form fields
    const errMap = {
      title: 'title',
      description: 'description',
      dueDate: 'due_date',
      course: 'course_id',
      timeEstimate: 'time_estimate',
      timeRemaining: 'time_estimate',
      priority: 'priority'
    }
    const errors = []
    for (const key in e.errors) {
      errors.push(errMap[key])
    }

    logger.error(
      `Failed to create new assignment for ${ctx.state.user.identifier}: ${e}`
    )

    return ctx.badRequest({
      errors
    })
  }

  logger.info(
    `${ctx.state.user.identifier} created new ${newAssignment.identifier}`
  )

  ctx.created({
    createdAssessment: newAssignment,
    createdAssignment: newAssignment,
    recurringAssignments
  })
}

/**
 * Edit assignment given assignmentID and properties to update. Assignment ID is passed as request param.
 * Request body:
 * - updates: object of updates to the assignment in the form of the assignment schema, e.g. { title: 'New Title', description: 'New desc.' }
 *
 * PATCH /assignments/a/:assignmentID
 * @param {Koa context} ctx
 * @returns The updated assignment
 */
async function updateAssignment (ctx) {
  const assignmentID = ctx.params.assignmentID
  const updates = ctx.request.body

  const disallowedProperties = [
    '_id',
    'termCode',
    '_student'
  ]

  if (updates.completed && updates.completed !== ctx.state.assignment.completed) {
    return ctx.badRequest('Do not use this route to change the completed status.')
  }

  disallowedProperties.forEach(prop => delete updates[prop])

  // Limit to this semester
  if (
    !moment(updates.dueDate).isBetween(
      ctx.session.currentTerm.startDate,
      ctx.session.currentTerm.endDate
    )
  ) {
    logger.error(
      `${
        ctx.state.user.rcs_id
      } tried to set assignment outside of current semester.`
    )
    return ctx.badRequest(
      'You cannot set an assignment due outisde of this semester.'
    )
  }

  // Update assignment
  ctx.state.assignment.set(updates)

  if ('dueDate' in updates) {
    if (moment(updates.dueDate).isBefore(moment())) {
      // Moved to the past
      for (const reminder of ctx.state.assignment.reminders) {
        reminder.sent = true
      }
    } else {
      // Update reminders
      for (const reminder of ctx.state.assignment.reminders) {
        // Find newly adjusted
        reminder.datetime = moment(updates.dueDate).subtract(reminder.count, reminder.unit)
      }
    }
  }

  try {
    await ctx.state.assignment.save()
  } catch (e) {
    logger.error(
      `Failed to update assignment ${assignmentID} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.badRequest('There was an error updating the assignment.')
  }

  logger.info(
    `${ctx.state.user.identifier} edited ${ctx.state.assignment.identifier}`
  )

  ctx.ok({
    updatedAssessment: ctx.state.assignment,
    updatedAssignment: ctx.state.assignment
  })
}

/**
 * Toggle an assignment's completion status. The assignment ID is passed in the request params.
 *
 * POST /assignments/a/:assignmentID/toggle
 * @param {Koa context} ctx
 * @returns The updated assignment
 */
async function toggleAssignment (ctx) {
  const assignmentID = ctx.params.assignmentID

  // Toggle completed status
  ctx.state.assignment.completed = !ctx.state.assignment.completed
  ctx.state.assignment.completedAt = ctx.state.assignment.completed
    ? moment().toDate()
    : null

  // Readjust time estimate if completed
  if (ctx.state.assignment.completed) {
    ctx.state.assignment.timeEstimate =
      ctx.state.assignment._blocks
        .filter(b => b.endTime <= ctx.state.assignment.completedAt)
        .reduce((acc, b) => acc + b.duration, 0) / 60 // MUST BE IN HOURS

    // Cut short any current blocks
    const ongoing = ctx.state.assignment._blocks.find(block => moment().isBetween(block.startTime, block.endTime))
    if (ongoing) {
      ongoing.endTime = new Date()
      await ongoing.save()

      if (ctx.state.user.integrations.google.calendarID) {
        try {
          await google.actions.patchEvent(ctx.state.user, ongoing._id, {
            end: {
              dateTime: ongoing.endTime
            }
          })
        } catch (e) {
          logger.error(
            `Failed to patch GCal event for work block for ${
              ctx.state.user.rcs_id
            }: ${e}`
          )
        }
      }
    }
  }
  ctx.state.assignment.confirmed = true

  try {
    await ctx.state.assignment.populate('_blocks')
    await ctx.state.assignment.save()
  } catch (e) {
    logger.error(`Failed to toggle assignment with ID ${assignmentID}: ${e}`)
    return ctx.badRequest('There was an error toggling the assignment.')
  }

  logger.info(
    `${ctx.state.user.identifier} set ${ctx.state.assignment.identifier} completion status to ${
      ctx.state.assignment.completed
    }`
  )

  ctx.ok({
    updatedAssessment: ctx.state.assignment,
    updatedAssignment: ctx.state.assignment
  })
}

/**
 * Given an assignment ID, remove the assignment only if it belongs to the logged in user.
 * The assignment should be in the params of the request.
 *
 * POST /assignments/a/:assignmentID/remove
 * @param {Koa context} ctx
 * @returns The removed assignment.
 */
async function deleteAssignment (ctx) {
  const assignmentID = ctx.params.assignmentID

  if (!ctx.state.isAssignmentOwner) {
    logger.error(
      `Student ${
        ctx.state.user.rcs_id
      } tried to delete shared assignment ${assignmentID}`
    )
    return ctx.forbidden(
      'You cannot delete shared assignments. Only the owner can!'
    )
  }

  // Delete assignment
  try {
    ctx.state.assignment.remove()
  } catch (e) {
    logger.error(`Failed to remove assignment with ID ${assignmentID}: ${e}`)
    return ctx.internalServerError(
      'There was an error removing the assignment.'
    )
  }

  logger.info(
    `${ctx.state.user.identifier} deleted ${ctx.state.assignment.identifier}`
  )

  let removedRecurringAssignments = []
  if (ctx.request.query.removeRecurring) {
    const rootAssignmentID = ctx.state.assignment._recurringOriginal
    const query = {
      _student: ctx.state.user._id,
      _recurringOriginal: rootAssignmentID
    }

    if (ctx.request.query.removeRecurring === 'future') {
      query.dueDate = { $gt: ctx.state.assignment.dueDate }
    }

    removedRecurringAssignments = await Assignment.find(query)

    // Delete all in series either past and future or just future
    for (const a of removedRecurringAssignments) a.remove()

    logger.info('Deleted recurring assignments')
  }

  ctx.ok({
    removedAssessment: ctx.state.assignment,
    removedAssignment: ctx.state.assignment,
    removedRecurringAssignments
  })
}

/* COMMENTS */
/**
 * Add a comment to an assignment. The request body should contain the following:
 * - comment: the text of the comment
 *
 * @param {Koa context} ctx
 * @returns The updated assignment
 */
async function addComment (ctx) {
  const assignmentID = ctx.params.assignmentID
  const text = ctx.request.body.comment

  // Add comment
  ctx.state.assignment.comments.push({
    _student: ctx.state.user,
    addedAt: new Date(),
    body: text
  })

  try {
    await ctx.state.assignment.save()
  } catch (e) {
    logger.error(
      `Failed to save assignment ${assignmentID} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.badRequest('There was an error adding the comment.')
  }

  logger.info(`${ctx.state.user.identifier} added a comment on ${ctx.state.assignment.identifier}`)

  ctx.ok({
    updatedAssessment: ctx.state.assignment,
    updatedAssignment: ctx.state.assignment
  })
}

/**
 * Delete a comment on an assignment. The request url should contain the following:
 * - index: the index of the comment to delete
 *
 * @param {Koa context} ctx
 * @returns The updated assignment
 */
async function deleteComment (ctx) {
  const assignmentID = ctx.params.assignmentID

  const index = ctx.params.commentIndex
  if (!ctx.state.assignment.comments[index]) {
    logger.error(
      `Student ${
        ctx.state.user.rcs_id
      } tried to delete nonexistent comment on assignment ${assignmentID}`
    )
    return ctx.badRequest('Could not find the comment to delete!')
  }

  if (
    !ctx.state.assignment.comments[index]._student ||
    !ctx.state.assignment.comments[index]._student._id.equals(
      ctx.state.user._id
    )
  ) {
    logger.error(
      `Student ${
        ctx.state.user.rcs_id
      } tried to delete other students comment on assignment ${assignmentID}`
    )
    return ctx.forbidden('You cannot delete somebody else\'s comment!')
  }

  // Delete the comment by its index

  ctx.state.assignment.comments.splice(index, 1)

  try {
    await ctx.state.assignment.save()
  } catch (e) {
    logger.error(
      `Failed to save assignment ${assignmentID} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.badRequest('There was an error adding the comment.')
  }

  logger.info(`${ctx.state.user.identifier} deleted a comment on ${ctx.state.assignment.identifier}`)

  ctx.ok({
    updatedAssessment: ctx.state.assignment,
    updatedAssignment: ctx.state.assignment
  })
}

async function generateAssignments (ctx) {
  // Make sure proper environment
  if (process.env.NODE_ENV !== 'development') return ctx.forbidden('Must be in development mode to generate assignments.')
  if (!ctx.state.user.admin) return ctx.forbidden('Must be an admin to generate assignments.')

  const { startDate, endDate, count } = ctx.request.body
  if (count < 0 || count > 30) {
    return ctx.badRequest('Count must be between 0 and 30 (inclusive)')
  }

  const term = ctx.session.currentTerm
  const courses = await ctx.state.user.getCoursesForTerm(term.code)

  const generateAssessments = []
  for (let i = 0; i < count; i++) {
    const newAssignment = new Assignment({
      _student: ctx.state.user._id,
      ...generateDummyAssignment(courses, term.code, startDate, endDate)
    })
    await newAssignment.save()

    generateAssessments.push(newAssignment)
  }

  ctx.created({ generateAssessments })
}

module.exports = {
  getAssignmentMiddleware,
  getTermAssignments,
  getAssignments,
  getAssignment,
  getAssignmentCollaboratorInfo,
  setAssignmentCollaborators,
  createAssignment,
  toggleAssignment,
  updateAssignment,
  deleteAssignment,
  addComment,
  deleteComment,
  generateAssignments
}
