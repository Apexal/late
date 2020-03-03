const moment = require('moment')
const logger = require('../../modules/logger')

const Exam = require('./exams.model')

/**
 * This middleware assumes that the route has a 'examID' parameter.
 * It gets the exam from this ID and makes it available to all subsequent routes
 * as ctx.state.exam
 *
 * @param {Koa context} ctx
 */
async function getExamMiddleware (ctx, next) {
  const examID = ctx.params.examID

  let exam
  try {
    exam = await Exam.findOne({
      _id: examID,
      _student: ctx.state.user._id
    })
      .populate('_student', '_id rcs_id name graduationYear')
      .populate('_blocks')
      .populate('comments._student', '_id rcs_id name graduationYear')
  } catch (e) {
    logger.error(
      `Error getting exam ${examID} for ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.internalServerError('Failed to get exam.')
  }

  if (!exam) {
    logger.error(
      `Failed to find exam with ID ${examID} for ${ctx.state.user.identifier}.`
    )
    return ctx.notFound('Could not find exam.')
  }

  ctx.state.exam = exam

  await next()
}

/**
 * Returns a list of all exams with optional filters.
 * start and end are optional URL query options in YYYY-MM-DD format.
 *
 * GET /exams
 * @param {Koa context} ctx
 */
async function getExams (ctx) {
  let exams
  const { start, end, title, courseCRN } = ctx.query
  try {
    exams = await ctx.state.user.getExams(start, end, title, courseCRN)
  } catch (e) {
    logger.error(`Failed to send exams to ${ctx.state.user.identifier}: ${e}`)
    return ctx.internalServerError('There was an error loading your exams.')
  }

  ctx.ok({
    exams
  })
}

/**
 * Get all of the logged in student's exams in a given term.
 * The term code is passed in the route params as :termCode
 *
 * @param {Koa context} ctx
 * @returns Array of the term's exams
 */
async function getTermExams (ctx) {
  const { termCode } = ctx.params

  const term = ctx.session.terms.find(term => term.code === termCode)

  let exams
  try {
    exams = await Exam.find({
      _student: ctx.state.user._id,
      $or: [
        { termCode },
        {
          date: {
            $gte: term.startDate,
            $lt: term.endDate
          }
        }
      ]
    })
  } catch (e) {
    logger.error(`Failed to get exams: ${e}`)
    return ctx.badRequest('There was an error getting the exams.')
  }

  logger.info(
    `Sending all exams for term ${termCode} to ${ctx.state.user.identifier}`
  )

  ctx.ok({
    exams
  })
}

/**
 * Get an exam by its ID.
 *
 * @param {Koa context} ctx
 */
async function getExam (ctx) {
  const examID = ctx.params.examID

  logger.info(`Sending ${ctx.state.exam.identifier} to ${ctx.state.user.identifier}`)

  ctx.ok({
    exam: ctx.state.exam
  })
}

/**
 * Add a new exam.
 *
 * @param {Koa context} ctx
 */
async function createExam (ctx) {
  const body = ctx.request.body
  const date = moment(body.date)

  // Limit to this semester
  if (
    !moment(date).isBetween(
      ctx.session.currentTerm.startDate,
      ctx.session.currentTerm.endDate
    )
  ) {
    logger.error(
      `${ctx.state.user.identifier} tried to add exam outside of current semester.`
    )
    return ctx.badRequest('You cannot add an exam outisde of this semester.')
  }

  const newExam = new Exam({
    _student: ctx.state.user._id,
    title: body.title,
    description: body.description,
    date: date.toDate(),
    courseCRN: body.courseCRN,
    priority: body.priority,
    timeEstimate: body.timeEstimate,
    timeRemaining: body.timeEstimate,
    comments: []
  })

  try {
    await newExam.save()
  } catch (e) {
    logger.error(`Failed to add exam for ${ctx.state.user.identifier}: ${e}`)
    return ctx.badRequest(`Failed to add exam ${body.title}`)
  }

  logger.info(`${ctx.state.user.identifier} added ${newExam.identifier}`)
  ctx.created({
    createdAssessent: newExam,
    createdExam: newExam
  })
}

async function editExam (ctx) {
  const examID = ctx.params.examID
  const updates = ctx.request.body

  // const allowedProperties = [
  //   '_id',
  //   'title',
  //   'description',
  //   'date',
  //   'courseCRN',
  //   'timeEstimate',
  //   'priority',
  //   'studyPlan'
  // ];

  // // Ensure no unallowed properties are passed to update
  // if (Object.keys(updates).some(prop => !allowedProperties.includes(prop))) {
  //   logger.error(
  //     `Failed to update exam for ${
  //       ctx.state.user.rcs_id
  //     } because of invalid update properties.`
  //   );
  //   return ctx.badRequest('Passed unallowed properties.');
  // }

  // Limit to this semester
  if (
    !moment(updates.date).isBetween(
      ctx.session.currentTerm.startDate,
      ctx.session.currentTerm.endDate
    )
  ) {
    logger.error(
      `${ctx.state.user.identifier} tried to set exam outside of current semester.`
    )
    return ctx.badRequest(
      'You cannot set an exam due outisde of this semester.'
    )
  }

  // Update exam
  ctx.state.exam.set(updates)

  try {
    await ctx.state.exam.save()
  } catch (e) {
    logger.error(
      `Failed to update exam ${examID} for ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.badRequest('There was an error updating the exam.')
  }

  logger.info(
    `${ctx.state.user.identifier} edited ${ctx.state.exam.identifier}`
  )

  ctx.ok({
    updatedAssessment: ctx.state.exam,
    updatedExam: ctx.state.exam
  })
}

/**
 * Given an exam ID, remove the exam only if it belongs to the logged in user.
 * The exam ID should be in the params of the request.
 *
 * POST /exams/e/:examID/remove
 * @param {Koa context} ctx
 * @returns The removed exam.
 */
async function deleteExam (ctx) {
  const examID = ctx.params.examID

  // Delete exam
  try {
    ctx.state.exam.remove()
  } catch (e) {
    return ctx.internalServerError('There was an error removing the exam.')
  }

  logger.info(
    `${ctx.state.user.identifier} deleted ${ctx.state.exam.identifier}`
  )

  ctx.ok({
    removedAssessment: ctx.state.exam,
    removedExam: ctx.state.exam
  })
}

/* COMMENTS */
/**
 * Add a comment to an exam. The request body should contain the following:
 * - comment: the text of the comment
 *
 * @param {Koa context} ctx
 * @returns The updated exam
 */
async function addComment (ctx) {
  const examID = ctx.params.examID
  const text = ctx.request.body.comment

  // Add comment
  ctx.state.exam.comments.push({
    _student: ctx.state.user,
    addedAt: new Date(),
    body: text
  })

  try {
    await ctx.state.exam.save()
  } catch (e) {
    logger.error(
      `Failed to save exam ${examID} for ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.badRequest('There was an error adding the comment.')
  }

  logger.info(`${ctx.state.user.identifier} addded a comment on ${ctx.state.exam.identifier}`)

  ctx.ok({
    updatedAssessment: ctx.state.exam,
    updatedExam: ctx.state.exam
  })
}

/**
 * Delete a comment on an exam. The request url should contain the following:
 * - index: the index of the comment to delete
 *
 * @param {Koa context} ctx
 * @returns The updated exam
 */
async function deleteComment (ctx) {
  const examID = ctx.params.examID

  const index = ctx.params.commentIndex

  // Delete the comment by its index
  ctx.state.exam.comments.splice(index, 1)

  try {
    await ctx.state.exam.save()
  } catch (e) {
    logger.error(
      `Failed to save exam ${examID} for ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.badRequest('There was an error adding the comment.')
  }

  logger.info(`${ctx.state.user.identifier} deleted a comment on ${ctx.state.exam.identifier}`)

  ctx.ok({
    updatedAssessment: ctx.state.exam,
    updatedExam: ctx.state.exam
  })
}

module.exports = {
  getExamMiddleware,
  getExams,
  getTermExams,
  getExam,
  createExam,
  editExam,
  deleteExam,
  addComment,
  deleteComment
}
