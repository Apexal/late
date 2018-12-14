const Block = require('./blocks.model');
const Assignment = require('../assignments/assignments.model');

async function addWorkBlock (ctx) {
  const { startTime, endTime } = ctx.request.body;

  // Get assessment
  console.log(ctx.params.assignmentID + ': ' + startTime + ' - ' + endTime);

  const newBlock = new Block({
    startTime,
    endTime
  });

  await newBlock.save();

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

module.exports = {
  addWorkBlock
};
