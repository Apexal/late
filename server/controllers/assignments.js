const moment = require('moment');

async function getNew(ctx, next) {
  ctx.state.title = 'New Assignment';
  await ctx.render('assignments/new');
}

async function postNew(ctx) {
  const body = ctx.request.body;
  console.log(body);

  // TODO: validation

  const due = moment(body.due_date);
  // set time from body.time

  const newAssignment = new ctx.db.Assignment({
    _student: ctx.state.user._id,
    title: body.title,
    description: body.description,
    dueDate: due.toDate(),
    course: body.courseId,
    timeEstimate: parseInt(body.time_estimate, 10),
    timeRemaining: parseInt(body.time_estimate, 10),
    isAssessment: false,
    priority: parseInt(body.priority)
  });

  console.log(newAssignment);

  //await newAssignment.save();

  ctx.redirect('/');
}

module.exports = { getNew, postNew };
