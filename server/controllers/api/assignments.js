async function listAllAssignments(ctx) {
  let assignments;
  if (ctx.query.dueBy)
    assignments = await ctx.state.user.findAssignmentsDueBy(ctx.query.dueBy);
  else if (ctx.query.dueOn)
    assignments = await ctx.state.user.findAssignmentsDueOn(ctx.query.dueOn);
  else assignments = await ctx.state.user.findAllAssignments();

  ctx.ok({ assignments });
}

async function removeAssignment(ctx) {
  const assignmentID = ctx.params.assignmentID;
  const removedAssignment = await ctx.db.Assignment.findOneAndDelete({
    //_student: ctx.state.user._id,
    _id: assignmentID
  }).exec();

  if (!removedAssignment) return ctx.notFound({ removedCount: 0 });

  ctx.ok({ removedAssignment, removedCount: 1 });
}

module.exports = { listAllAssignments, removeAssignment };
