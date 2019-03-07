const moment = require('moment');
const logger = require('../../modules/logger');

const { compileWeeklyOpenSchedule } = require('../../modules/auto_allocate');

const Block = require('../blocks/blocks.model');
const Assignment = require('./assignments.model');

async function getAssignmentMiddleware (ctx, next) {
  const assignmentID = ctx.params.assignmentID;

  let assignment;
  try {
    assignment = await Assignment.findOne({
      _id: assignmentID,
      _student: ctx.state.user._id
    }).populate('_blocks');
  } catch (e) {
    logger.error(
      `Error getting assignment ${assignmentID} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.internalServerError(
      'There was an error getting the assignment.'
    );
  }

  if (!assignment) {
    logger.error(
      `Failed to find assignment with ID ${assignmentID} for ${
        ctx.state.user.rcs_id
      }.`
    );
    return ctx.notFound('Could not find assignment.');
  }

  ctx.state.assignment = assignment;
  await next();
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
  let assignments;

  try {
    assignments = await ctx.state.user.getAssignments(
      ctx.query.start,
      ctx.query.end,
      ctx.query.title,
      ctx.query.courseCRN
    );
  } catch (e) {
    logger.error(
      `Failed to send assignments to ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.internalServerError(
      'There was an error getting your assignments.'
    );
  }

  logger.info(`Sending assignments to ${ctx.state.user.rcs_id}`);

  ctx.ok({
    assignments
  });
}

/**
 * Given an assignment ID, return the assignment only if it belongs to the logged in user.
 *
 * GET /assignments/a/:assignmentID
 * @param {Koa context} ctx
 * @returns The assignment
 */
async function getAssignment (ctx) {
  const assignmentID = ctx.params.assignmentID;
  logger.info(`Sending assignment ${assignmentID} to ${ctx.state.user.rcs_id}`);

  ctx.ok({
    assignment: ctx.state.assignment
  });
}

/**
 * Create an assignment given the assignment properies in the request body.
 * Request body:
 *  - title, description, dueDate, course_crn, time_estimate, priority
 *
 * POST /assignments
 * @param {Koa context} ctx
 * @returns The created assignment
 */
async function createAssignment (ctx) {
  const body = ctx.request.body;
  const due = moment(body.dueDate);

  // Limit to this semester
  if (
    !due.isBetween(ctx.session.currentTerm.start, ctx.session.currentTerm.end)
  ) {
    logger.error(
      `${
        ctx.state.user.rcs_id
      } tried to add assignment outside of current semester.`
    );
    return ctx.badRequest(
      'You cannot add an assignment due outisde of this semester.'
    );
  }
  const assignmentData = {
    _student: ctx.state.user._id,
    title: body.title,
    description: body.description,
    dueDate: due.toDate(),
    courseCRN: body.courseCRN,
    timeEstimate: body.timeEstimate,
    timeRemaining: body.timeEstimate,
    priority: parseInt(body.priority, 10),
    isRecurring: body.isRecurring
  };
  const newAssignment = new Assignment(assignmentData);

  // AUTO WORK-BLOCK ALLOCATION
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
  let recurringAssignments = [];
  try {
    await newAssignment.save();

    if (body.isRecurring) {
      // Create all assignments every week up until end of classes in current semester
      logger.info('Creating recurring assignments...');

      // For other days of the week
      for (let dayIndex of body.recurringDays) {
        const nextFirst = moment(due).add(1, 'day');
        while (nextFirst.day() !== dayIndex) {
          nextFirst.add(1, 'day');
        }

        // For day of week of actual assignment
        while (nextFirst.isBefore(ctx.session.currentTerm.classesEnd)) {
          const recurringAssignment = new Assignment({
            ...assignmentData,
            recurringOriginal: newAssignment._id,
            dueDate: nextFirst
          });
          await recurringAssignment.save();
          recurringAssignments.push(recurringAssignment);

          nextFirst.add(1, 'week');
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
    };
    const errors = [];
    for (const key in e.errors) {
      errors.push(errMap[key]);
    }

    logger.error(
      `Failed to create new assignment for ${ctx.state.user.rcs_id}: ${e}`
    );

    return ctx.badRequest({
      errors
    });
  }

  logger.info(
    `Created new assigment '${newAssignment.title}' for ${
      ctx.state.user.rcs_id
    }`
  );

  ctx.created({
    createdAssignment: newAssignment,
    recurringAssignments
  });
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
async function editAssignment (ctx) {
  const assignmentID = ctx.params.assignmentID;
  const updates = ctx.request.body;

  const allowedProperties = [
    'title',
    'description',
    'dueDate',
    'courseCRN',
    'timeEstimate',
    'priority'
  ];

  // Ensure no unallowed properties are passed to update
  if (Object.keys(updates).some(prop => !allowedProperties.includes(prop))) {
    logger.error(
      `Failed to update assignment for ${
        ctx.state.user.rcs_id
      } because of invalid update properties.`
    );
    return ctx.badRequest('Passed unallowed properties.');
  }

  // Limit to this semester
  if (
    !moment(updates.dueDate).isBetween(
      ctx.session.currentTerm.start,
      ctx.session.currentTerm.end
    )
  ) {
    logger.error(
      `${
        ctx.state.user.rcs_id
      } tried to set assignment outside of current semester.`
    );
    return ctx.badRequest(
      'You cannot set an assignment due outisde of this semester.'
    );
  }

  // Update assignment
  ctx.state.assignment.set(updates);

  try {
    await ctx.state.assignment.save();
  } catch (e) {
    logger.error(
      `Failed to update assignment ${assignmentID} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('There was an error updating the assignment.');
  }

  logger.info(
    `Updated assignment ${ctx.state.assignment._id} for ${
      ctx.state.user.rcs_id
    }.`
  );

  ctx.ok({
    updatedAssignment: ctx.state.assignment
  });
}

/**
 * Toggle an assignment's completion status. The assignment ID is passed in the request params.
 *
 * POST /assignments/a/:assignmentID/toggle
 * @param {Koa context} ctx
 * @returns The updated assignment
 */
async function toggleAssignment (ctx) {
  const assignmentID = ctx.params.assignmentID;

  // Toggle completed status
  ctx.state.assignment.completed = !ctx.state.assignment.completed;
  ctx.state.assignment.completedAt = ctx.state.assignment.completed
    ? moment().toDate()
    : null;

  // Readjust time estimate if completed
  if (ctx.state.assignment.completed) {
    ctx.state.assignment.timeEstimate =
      ctx.state.assignment._blocks
        .filter(b => b.endTime <= ctx.state.assignment.completedAt)
        .reduce((acc, b) => acc + b.duration, 0) / 60; // MUST BE IN HOURS
  }

  try {
    await ctx.state.assignment.save();
  } catch (e) {
    logger.error(`Failed to toggle assignment with ID ${assignmentID}.`);
    return ctx.badRequest('There was an error toggling the assignment.');
  }

  logger.info(
    `Set assigment ${ctx.state.assignment._id} completion status to ${
      ctx.state.assignment.completed
    } for ${ctx.state.user.rcs_id}.`
  );

  ctx.ok({
    updatedAssignment: ctx.state.assignment
  });
}

/**
 * Given an assignment ID, remove the assignment only if it belongs to the logged in user.
 * The assignment should be in the params of the request.
 *
 * POST /assignments/a/:assignmentID/remove
 * @param {Koa context} ctx
 * @returns The removed assignment.
 */
async function removeAssignment (ctx) {
  const assignmentID = ctx.params.assignmentID;

  // Remove assignment
  try {
    ctx.state.assignment.remove();
  } catch (e) {
    logger.error(`Failed to remove assignment with ID ${assignmentID}: ${e}`);
    return ctx.internalServerError(
      'There was an error removing the assignment.'
    );
  }

  logger.info(
    `Removed assignment ${ctx.state.assignment._id} for ${
      ctx.state.user.rcs_id
    }`
  );

  ctx.ok({
    removedAssignment: ctx.state.assignment
  });
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
  const assignmentID = ctx.params.assignmentID;
  const text = ctx.request.body.comment;

  // Add comment
  ctx.state.assignment.comments.push({
    addedAt: new Date(),
    body: text
  });

  try {
    await ctx.state.assignment.save();
  } catch (e) {
    logger.error(
      `Failed to save assignment ${assignmentID} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('There was an error adding the comment.');
  }

  ctx.ok({ updatedAssignment: ctx.state.assignment });
}

/**
 * Delete a comment on an assignment. The request url should contain the following:
 * - index: the index of the comment to delete
 *
 * @param {Koa context} ctx
 * @returns The updated assignment
 */
async function deleteComment (ctx) {
  const assignmentID = ctx.params.assignmentID;

  const index = ctx.params.commentIndex;

  // Remove the comment by its index
  ctx.state.assignment.comments.splice(index, 1);

  try {
    await ctx.state.assignment.save();
  } catch (e) {
    logger.error(
      `Failed to save assignment ${assignmentID} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('There was an error adding the comment.');
  }

  ctx.ok({ updatedAssignment: ctx.state.assignment });
}

module.exports = {
  getAssignmentMiddleware,
  getAssignments,
  getAssignment,
  createAssignment,
  toggleAssignment,
  editAssignment,
  removeAssignment,
  addComment,
  deleteComment
};
