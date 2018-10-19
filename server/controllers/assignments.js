const moment = require('moment');
const logger = require('../logger');

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
    course: body.course_id,
    timeEstimate: parseInt(body.time_estimate, 10),
    timeRemaining: parseInt(body.time_estimate, 10),
    isAssessment: false,
    priority: parseInt(body.priority)
  });

  await newAssignment.save();

  logger.info(
    `Saved new assignment titled '${newAssignment.title}' for student ${
      ctx.state.user.rcs_id
    } due on ${due.format('YYYY-MM-DD hh:mm a')}`
  );

  ctx.redirect('/');
}

module.exports = { getNew, postNew };
