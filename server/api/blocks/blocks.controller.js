const Block = require('./blocks.model');
const Assignment = require('../assignments/assignments.model');
const Exam = require('../exams/exams.model');

const logger = require('../../modules/logger');

async function addWorkBlock (ctx) {
  const { startTime, endTime, assessmentType } = ctx.request.body;

  logger.info(`Adding work block for ${ctx.state.user.rcs_id}`);

  const newBlock = new Block({
    _student: ctx.state.user._id,
    startTime,
    endTime
  });

  await newBlock.save();

  let assessment;
  // Get assessment
  assessment = await (assessmentType === 'assignment' ? Assignment : Exam)
    .findOne({
      _student: ctx.state.user._id,
      _id:
        ctx.params[assessmentType === 'assignment' ? 'assignmentID' : 'examID']
    })
    .populate('_blocks');

  assessment._blocks.push(newBlock);

  await assessment.save();

  return ctx.ok({
    // eslint-disable-next-line standard/computed-property-even-spacing
    ['updated' +
    (assessmentType === 'assignment' ? 'Assignment' : 'Exam')]: assessment
  });
}

async function editWorkBlock (ctx) {
  const { startTime, endTime, assessmentType } = ctx.request.body;
  const blockID = ctx.params.blockID;

  const editedBlock = await Block.findOne({
    _student: ctx.state.user._id,
    _id: blockID
  });

  editedBlock.set({ startTime, endTime });
  await editedBlock.save();

  let assessment;
  // Get assessment
  assessment = await (assessmentType === 'assignment' ? Assignment : Exam)
    .findOne({
      _student: ctx.state.user._id,
      _id:
        ctx.params[assessmentType === 'assignment' ? 'assignmentID' : 'examID']
    })
    .populate('_blocks');

  logger.info(`Edit work block for ${ctx.state.user.rcs_id}`);

  return ctx.ok({
    // eslint-disable-next-line standard/computed-property-even-spacing
    ['updated' +
      (assessmentType === 'assignment' ? 'Assignment' : 'Exam')]: assessment
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
  editWorkBlock,
  removeWorkBlock
};
