
async function makeBlocks (ctx) {
  const user = await ctx.db.Student.findOne()
    .byUsername(ctx.session.cas_user.toLowerCase())
    .exec();
  const assigns = await user.findAllAssignments();
  const blocks = splitAssignments(ctx, assigns);
  orderBlocks(blocks);
  const ret = blocks.map(block => {
    block.priority = block._assignment.priority;
    block.title = block._assignment.title;
    delete block._assignment;
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
  // priority is from 1 to 10, 1 does not affect random placement at all
  // while 10 (high priority) is likely to be placed at the beginning
  // This for loop randomly shuffles the blocks with a bias for placing
  // high priority assignments at the end. We reverse the array afterwards.
  // This backwards loop results in a better distribution than the forwards
  // loop.
  for (let i = blocks.length - 1; i > 0; i--) {
    const block = blocks[i];
    const j = calcPosition(block, i, blocks);
    if (i !== j) {
      blocks[i] = blocks[j];
      blocks[j] = block;
    }
  }
  blocks.reverse();
}

/**
 * Assigns start date times to each block.
 */
function placeBlocks (user, block) {
  // collect free time slots as bins

  // place blocks into bins first-come-first-serve

  // continue until blocks are filled

  // if we can't fit...we don't sit?
}

/**
 * Calculates a new index for the given block.
 * @param block the block
 * @param idx the current index of the block
 * @param blocks the array of blocks
 */
function calcPosition (block, idx, blocks) {
  return Math.floor(Math.random() * (idx + 1) / (block._assignment.priority));
}

module.exports = {
  makeBlocks
};
