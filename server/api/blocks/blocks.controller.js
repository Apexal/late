const Block = require('./blocks.model');
const Assignment = require('../assignments/assignments.model');

const logger = require('../../modules/logger');

async function addWorkBlock (ctx) {
  const { startTime, endTime } = ctx.request.body;

  logger.info(`Adding work block for ${ctx.state.user.rcs_id}`);

  const newBlock = new Block({
    _student: ctx.state.user._id,
    startTime,
    endTime
  });

  await newBlock.save();

  // Get assessment
  const assignment = await Assignment.findOne({
    _student: ctx.state.user._id,
    _id: ctx.params.assignmentID
  }).populate('_blocks');

  assignment._blocks.push(newBlock);

  await assignment.save();

  return ctx.ok({
    updatedAssignment: assignment
  });
}

async function removeWorkBlock (ctx) {
  const blockID = ctx.params.blockID;

  const removedBlock = await Block.findOne({
    _student: ctx.state.user._id,
    _id: blockID
  });
  removedBlock.remove();

  logger.info(`Removed work block for ${ctx.state.user.rcs_id}`);

  ctx.ok({
    removedBlock
  });
}

module.exports = {
  addWorkBlock,
  removeWorkBlock
};
