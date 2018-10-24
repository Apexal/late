async function listAllAssignments(ctx) {
  let assignments;
  if (ctx.query.dueBy)
    assignments = await ctx.state.user.findAssignmentsDueBy(ctx.query.dueBy);
  else if (ctx.query.dueOn)
    assignments = await ctx.state.user.findAssignmentsDueOn(ctx.query.dueOn);
  else assignments = await ctx.state.user.findAllAssignments();

  ctx.ok({ assignments });
}

module.exports = { listAllAssignments };
