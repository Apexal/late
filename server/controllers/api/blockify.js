
async function makeBlocks (ctx) {
  const user = await ctx.db.Student.findOne()
    .byUsername(ctx.session.cas_user.toLowerCase())
    .exec();
  const assigns = await user.findAllAssignments();
  const blocks = splitAssignments(ctx, assigns);
  orderBlocks(blocks);
  const ret = blocks.map(block => {
    block._assignment = {
      title: block._assignment.title,
      priority: block._assignment.priority
    };
    return block;
  });
  return ctx.ok(ret);
}

/**
 * Splits the given assignment DB objects into blocks.
 * The blocks are not added to the DB yet.
 */
function splitAssignments (ctx, assignments) {
  const blocks = [];
  for (const a of assignments) {
    // estimated minutes remaining in assignment
    let timeRemaining = a.timeRemaining * 60;
    // for now, split everything into 30 minute blocks
    while (timeRemaining > 0) {
      const block = /* new ctx.db.Block */({
        _assignment: a,
        startTime: null,
        duration: Math.min(30, timeRemaining)
      });
      blocks.push(block);
      timeRemaining -= 30;
    }
  }
  return blocks;
}

/**
 * Orders the blocks in some way.
 */
function orderBlocks (blocks) {
  // priority is from 1 to 10, 10 does not affect random placement at all
  for (let i = blocks.length - 1; i > 0; i--) {
    const block = blocks[i];
    const j = Math.floor(Math.random() * (i + 1) / (11 - block._assignment.priority));
    if (i !== j) {
      blocks[i] = blocks[j];
      blocks[j] = block;
    }
  }
}

module.exports = {
  makeBlocks
};
