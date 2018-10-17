const db = require('../../db');

async function getNew(ctx, next) {
  ctx.state.title = "New Assignment";
  await ctx.render('assignments/new');
}

async function postNew(ctx, next) {
  const body = ctx.request.body;
  console.log(body);
  // TODO validation
  const Assignment = db.models.Assignment;
  const assign = new Assignment({
    title: body.title,
    description: body.description,
    dueDate: new Date(body.due_date),
    timeEstimate: parseInt(body.time_estimate, 10),
    timeRemaining: parseInt(body.time_estimate, 10),
    priority: parseInt(body.priority)
  });
  // TODO save assignment to database
  ctx.redirect('/');
}

module.exports = { getNew, postNew };
