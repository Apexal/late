async function getNew(ctx, next) {
  ctx.state.title = "New Assignment";
  await ctx.render('assignments/new');
}

async function postNew(ctx, next) {
  // TODO
  ctx.redirect('/');
}

module.exports = { getNew, postNew };
