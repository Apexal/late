const moment = require('moment');
const logger = require('../logger');

/**
 * Toggle the completion status of an object.
 */
async function toggleAssignment(ctx) {
  const assignmentID = ctx.params.assignmentID;
  const assignment = await ctx.db.Assignment.findById(assignmentID).exec();

  if (!assignment) throw new Error('Assignment not found.');

  assignment.completed = !assignment.completed;

  await assignment.save();
  logger.info(
    `${ctx.state.user.rcs_id} toggled assignment ${assignment.title} (${
      assignment._id
    })`
  );
  ctx.redirect('back');
}

/**
 * Render the new assignment page which needs a
 * course list for the course select box.
 */
async function getNew(ctx) {
  ctx.state.title = 'New Assignment';

  // Get courses for course select box
  // This is just shorthand since the user and their schedule is already passed to the view
  ctx.state.courses = ctx.state.user.course_schedule;

  await ctx.render('assignments/new');
}

/**
 * Given the data from the new assignment form,
 * create a new assignment and attempt to save it.
 */
async function postNew(ctx) {
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
      `Saved new assignment titled '${newAssignment.title}' (${
        newAssignment._id
      }) for student ${ctx.state.user.rcs_id} due on ${due.format(
        'YYYY-MM-DD hh:mm a'
      )}`
    );

    ctx.request.flash('success', 'Added new assignment.');
    ctx.redirect('back');
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
    const errs = [];
    for (const key in err.errors) {
      errs.push(errMap[key]);
    }
    ctx.status = 422; // unprocessable entity
    ctx.body = errs;
  }
}

/**
 * Find all upcoming assignments for the current user
 * and group them by due date. Renders a list of all
 * upcoming assignments.
 */
async function getList(ctx) {
  ctx.state.title = 'All Assignment';
  const assignments = (ctx.state.assignments = await ctx.state.user.findAllAssignments());

  // Group by date
  const dueDates = {};

  // Iterate through assignments and based on their due date
  // (not time) group them in the dueDates object
  for (let a of assignments) {
    const day = moment(a.dueDate).format('YYYY-MM-DD');

    if (!dueDates[day]) dueDates[day] = [];

    dueDates[day].push(a);
  }

  ctx.state.groupedByDate = dueDates;

  await ctx.render('assignments/list');
}

module.exports = { toggleAssignment, getNew, postNew, getList };
