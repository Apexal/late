const moment = require('moment');
const logger = require('../logger');

async function getNew(ctx, next) {
  ctx.state.title = 'New Assignment';

  // Get courses for course select box
  ctx.state.courses = ctx.state.user.course_schedule;

  await ctx.render('assignments/new');
}

async function postNew(ctx) {
  const body = ctx.request.body;
  console.log(body);

  const due = moment(body.due_date);
  // set time from body.time

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

  await newAssignment.save();

  logger.info(
    `Saved new assignment titled '${newAssignment.title}' for student ${
      ctx.state.user.rcs_id
    } due on ${due.format('YYYY-MM-DD hh:mm a')}`
  );

  try {
    await newAssignment.save();
    ctx.request.flash('success', 'Added new assignment.');
    ctx.redirect('/');
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

async function getList(ctx) {
  const assignments = (ctx.state.assignments = await ctx.state.user.findAllAssignments(
    true
  ));

  // Group by date
  const dueDates = {};

  for (let a of assignments) {
    const day = moment(a.dueDate)
      .startOf('day')
      .format('YYYY-MM-DD');

    if (!dueDates[day]) dueDates[day] = [];

    dueDates[day].push(a);
  }

  ctx.state.groupedByDate = dueDates;

  console.log(dueDates);

  await ctx.render('assignments/list');
}

module.exports = { getNew, postNew, getList };
