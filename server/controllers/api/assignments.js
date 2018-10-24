async function listAllAssignments(ctx) {
  ctx.ok({ assignments: [1, 3, 5] });
}

module.exports = { listAllAssignments };
