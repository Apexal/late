const moment = require('moment');
const logger = require('../../modules/logger');

const Assignment = require('./assignments.model');

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
      ctx.query.end
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

  logger.info(`Sending assignment ${assignmentID} to ${ctx.state.user.rcs_id}`);

  ctx.ok({
    assignment
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
  if (due.isAfter(ctx.session.currentTerm.end)) {
    logger.error(
      `${
        ctx.state.user.rcs_id
      } tried to add assignment outside of current semester.`
    );
    return ctx.badRequest(
      'You cannot add an assignment due outisde of this semester.'
    );
  }

  const newAssignment = new Assignment({
    _student: ctx.state.user._id,
    title: body.title,
    description: body.description,
    dueDate: due.toDate(),
    courseCRN: body.courseCRN,
    timeEstimate: body.timeEstimate,
    timeRemaining: body.timeEstimate,
    priority: parseInt(body.priority, 10)
  });

  try {
    await newAssignment.save();
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
    createdAssignment: newAssignment
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

  let assignment;
  try {
    assignment = await Assignment.findOne({
      _id: assignmentID,
      _student: ctx.state.user._id
    }).populate('_blocks');
  } catch (e) {
    logger.error(
      `Error finding assignment ${assignmentID} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.internalServerError(
      'There was an error getting the assignment.'
    );
  }

  if (!assignment) {
    ctx.error(
      `Could not find assignment ${assignmentID} for ${ctx.state.user.rcs_id}.`
    );
    return ctx.notFound('Could not find assignment.');
  }

  // Limit to this semester
  if (moment(updates.dueDate).isAfter(ctx.session.currentTerm.end)) {
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
  assignment.set(updates);

  try {
    await assignment.save();
  } catch (e) {
    logger.error(
      `Failed to update assignment ${assignmentID} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('There was an error updating the assignment.');
  }

  logger.info(
    `Updated assignment ${assignment._id} for ${ctx.state.user.rcs_id}.`
  );

  ctx.ok({
    updatedAssignment: assignment
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

  let assignment;
  try {
    assignment = await Assignment.findOne({
      _id: assignmentID,
      _student: ctx.state.user._id
    }).populate('_blocks');
  } catch (e) {
    logger.error(
      `Failed to update completion status of assignment ${assignmentID} for ${
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
    return ctx.notFound('Could not find the assignment.');
  }

  // Toggle completed status
  assignment.completed = !assignment.completed;
  assignment.completedAt = assignment.completed ? moment().toDate() : null;

  try {
    await assignment.save();
  } catch (e) {
    logger.error(`Failed to toggle assignment with ID ${assignmentID}.`);
    return ctx.badRequest('There was an error toggling the assignment.');
  }

  logger.info(
    `Set assigment ${assignment._id} completion status to ${
      assignment.completed
    } for ${ctx.state.user.rcs_id}.`
  );

  ctx.ok({
    updatedAssignment: assignment
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
  let removedAssignment;
  try {
    removedAssignment = await Assignment.findOne({
      _id: assignmentID,
      _student: ctx.state.user._id
    }).populate('_blocks');
  } catch (e) {
    logger.error(
      `Failed to remove assignment ${assignmentID} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.internalServerError('Could not find the assignment.');
  }

  if (!removedAssignment) {
    logger.error(
      `Could not find assignment ${assignmentID} for ${ctx.state.user.rcs_id}.`
    );
    return ctx.notFound('Could not find assignment.');
  }

  // Remove assignment
  try {
    removedAssignment.remove();
  } catch (e) {
    return ctx.internalServerError(
      'There was an error removing the assignment.'
    );
  }

  logger.info(
    `Removed assignment ${removedAssignment._id} for ${ctx.state.user.rcs_id}`
  );

  ctx.ok({
    removedAssignment
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

  let assignment;
  try {
    assignment = await Assignment.findOne({
      _student: ctx.state.user._id,
      _id: assignmentID
    });
  } catch (e) {
    logger.error(`Failed to get assignment for ${ctx.state.user.rcs_id}: ${e}`);
    return ctx.internalServerError(
      'There was an error getting the assignment to comment on.'
    );
  }

  if (!assignment) {
    logger.error(
      `Failed to find assignment with ID ${assignmentID} for ${
        ctx.state.user.rcs_id
      }`
    );
    return ctx.notFound('Could not find assignment to comment on.');
  }

  // Add comment
  assignment.comments.push({
    addedAt: new Date(),
    body: text
  });

  try {
    await assignment.save();
  } catch (e) {
    logger.error(
      `Failed to save assignment for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('There was an error adding the comment.');
  }

  ctx.ok({ updatedAssignment: assignment });
}

module.exports = {
  getAssignments,
  getAssignment,
  createAssignment,
  toggleAssignment,
  editAssignment,
  removeAssignment,
  addComment
};
