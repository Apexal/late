const moment = require('moment');
const logger = require('../../logger');

/**
 * Returns a list of all assignments with optional dueOn or dueBy filters.
 * dueOn and dueBy are optional URL query options in YYYY-MM-DD format.
 *
 * @param {Koa context} ctx
 */
async function getAssignments (ctx) {
  const assignments = await ctx.state.user.getAssignments(
    ctx.query.start,
    ctx.query.end
  );

  logger.info(`Sending assignments to ${ctx.state.user.rcs_id}`);

  ctx.ok({
    assignments
  });
}

/**
 * Given an assignment ID, return the assignment only if it belongs to the logged in user.
 * @param {Koa context} ctx
 */
async function getAssignment (ctx) {
  const assignmentID = ctx.params.assignmentID;
  let assignment;
  try {
    assignment = await ctx.db.Assignment.findOne({
      _id: assignmentID,
      _student: ctx.state.user._id
    });
    if (!assignment) throw new Error();
  } catch (e) {
    logger.error(
      `Failed to get assignment ${assignmentID} for ${ctx.state.user.rcs_id}`
    );
    return ctx.notFound('Failed to find assignment.');
  }

  logger.info(`Sending assignment ${assignmentID} to ${ctx.state.user.rcs_id}`);

  ctx.ok({
    assignment
  });
}

/**
 * Create an assignment given the assignment properies in the request body.
 *
 * @param {Koa context} ctx
 */
async function createAssignment (ctx) {
  const body = ctx.request.body;
  const due = moment(body.due_date);
  // TODO: set time from body.time

  // TODO: validate these
  const newAssignment = new ctx.db.Assignment({
    _student: ctx.state.user._id,
    title: body.title,
    description: body.description,
    dueDate: due.toDate(),
    courseCRN: body.course_crn,
    timeEstimate: parseInt(body.time_estimate, 10),
    timeRemaining: parseInt(body.time_estimate, 10),
    isAssessment: false,
    priority: parseInt(body.priority, 10)
  });

  try {
    await newAssignment.save();

    logger.info(
      `Created new assigment '${newAssignment.title}' for ${
        ctx.state.user.rcs_id
      }`
    );

    ctx.ok({
      createdAssignment: newAssignment
    });
  } catch (err) {
    // mapping schema fields to form fields
    const errMap = {
      title: 'title',
      description: 'description',
      dueDate: 'due_date',
      course: 'course_id',
      timeEstimate: 'time_estimate',
      timeRemaining: 'time_estimate',
      isAssesment: '',
      priority: 'priority'
    };
    const errors = [];
    for (const key in err.errors) {
      errors.push(errMap[key]);
    }

    logger.error(
      `Failed to create new assignment for ${ctx.state.user.rcs_id}`
    );

    ctx.badRequest({
      errors
    });
  }
}

/**
 * Edit assignment.
 * Request body:
 * - updates: object of updates to the assignment in the form of the assignment schema, e.g. { title: 'New Title', description: 'New desc.' }
 *
 * @param {Koa context} ctx
 */
async function editAssignment (ctx) {
  const assignmentID = ctx.params.assignmentID;
  const updates = ctx.request.body;
  console.log(updates);

  const allowedProperties = [
    'title',
    'dueDate',
    'description',
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
    assignment = await ctx.db.Assignment.findOne({
      _id: assignmentID,
      _student: ctx.state.user._id
    });

    Object.assign(assignment, updates); // So cool!

    await assignment.save();
  } catch (e) {
    logger.error(
      `Failed to update assignment for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.internalServerError('Invalid properties to update.');
  }

  logger.info(
    `Updated assignment '${assignment.title}' for ${ctx.state.user.rcs_id}.`
  );

  ctx.ok({
    updatedAssignment: assignment
  });
}

/**
 * Toggle an assignment's completion status.
 *
 * @param {Koa context} ctx
 */

async function toggleAssignment (ctx) {
  const assignmentID = ctx.params.assignmentID;

  if (!assignmentID) return ctx.badRequest('Invalid assignment id.');

  let assignment;

  try {
    assignment = await ctx.db.Assignment.findOne({
      _id: assignmentID,
      _student: ctx.state.user._id
    }).exec();

    assignment.completed = !assignment.completed;

    await assignment.save();
  } catch (e) {
    logger.error(
      `Failed to update completion status of assignment for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest(
      `Failed to update completion status of assignment for ${
        ctx.state.user.rcs_id
      }`
    );
  }

  logger.info(
    `Set assigment '${assignment.title}' completion status to ${
      assignment.completed
    }.`
  );

  ctx.ok({
    updatedAssignment: assignment
  });
}

/**
 * Given an assignment ID, remove the assignment only if it belongs to the logged in user.
 *
 * @param {Koa context} ctx
 */
async function removeAssignment (ctx) {
  const assignmentID = ctx.params.assignmentID;
  let removedAssignment;
  try {
    removedAssignment = await ctx.db.Assignment.findOne({
      _id: assignmentID,
      _student: ctx.state.user._id
    });

    removedAssignment.remove();

    if (!removedAssignment) throw new Error();
  } catch (e) {
    logger.error(`Failed to remove assignment for  ${ctx.state.user.rcs_id}`);
    return ctx.notFound('Failed to find assignment.');
  }

  logger.info(
    `Removed assignment '${removedAssignment.title}' for ${
      ctx.state.user.rcs_id
    }`
  );

  ctx.ok({
    removedAssignment
  });
}

module.exports = {
  getAssignments,
  getAssignment,
  createAssignment,
  toggleAssignment,
  editAssignment,
  removeAssignment
};
