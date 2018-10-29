const moment = require('moment');

/**
 * Returns a list of all assignments with optional dueOn or dueBy filters.
 * dueOn and dueBy are optional URL query options in YYYY-MM-DD format.
 *
 * @param {Koa context} ctx
 */
async function listAllAssignments(ctx) {
  const user = await ctx.db.Student.findOne().byUsername(ctx.session.cas_user.toLowerCase()).exec();
  let assignments;
  if (ctx.query.dueBy)
    assignments = await user.findAssignmentsDueBy(ctx.query.dueBy);
  else if (ctx.query.dueOn)
    assignments = await user.findAssignmentsDueOn(ctx.query.dueOn);
  else assignments = await user.findAllAssignments();

  ctx.ok({
    assignments
  });
}

/**
 * Given an assignment ID, return the assignment only if it belongs to the logged in user.
 * @param {Koa context} ctx
 */
async function getAssignment(ctx) {
  const assignmentID = ctx.params.assignmentID;
  const assignment = await ctx.db.Assignment.findOne({
    _id: assignmentID,
    _student: ctx.state.user._id
  });

  if (!assignment) return ctx.notFound('Assignment not found.');

  ctx.ok({
    assignment
  });
}

/**
 * Create an assignment given the assignment properies in the request body.
 *
 * @param {Koa context} ctx
 */
async function createAssignment(ctx) {
  const user = await ctx.db.Student.findOne().byUsername(ctx.session.cas_user.toLowerCase()).exec();

  const body = ctx.request.body;
  console.log(body);

  const due = moment(body.due_date);
  // TODO: set time from body.time

  // TODO: validate these
  const newAssignment = new ctx.db.Assignment({
    _student: user._id,
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

    ctx.badRequest({
      errors
    });
  }
}

/**
 * Given an assignment ID, remove the assignment only if it belongs to the logged in user.
 *
 * @param {Koa context} ctx
 */
async function removeAssignment(ctx) {
  const assignmentID = ctx.params.assignmentID;
  const removedAssignment = await ctx.db.Assignment.findOneAndDelete({
    //_student: ctx.state.user._id,
    _id: assignmentID
  }).exec();

  if (!removedAssignment) return ctx.notFound({
    removedCount: 0
  });

  ctx.ok({
    removedAssignment,
    removedCount: 1
  });
}

module.exports = {
  listAllAssignments,
  getAssignment,
  createAssignment,
  removeAssignment
};