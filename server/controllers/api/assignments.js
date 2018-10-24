async function listAllAssignments(ctx) {
  const assignments = await ctx.state.user.findAllAssignments();
  ctx.ok({ assignments });
}

module.exports = { listAllAssignments };
