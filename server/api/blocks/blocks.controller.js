const Block = require('./blocks.model');
const Assignment = require('../assignments/assignments.model');
const Exam = require('../exams/exams.model');

const logger = require('../../modules/logger');

/**
 * Add a work block to a specific assignment and have the updated
 * assignment returned. The request body should contain the following:
 * - startTime
 * - endTime
 * - assessmentType
 *
 * @param {Koa context} ctx
 * @returns The updated assignment with the new block added
 *
 * POST /
 */
async function addWorkBlock (ctx) {
  const { startTime, endTime, assessmentType } = ctx.request.body;

  const newBlock = new Block({
    _student: ctx.state.user._id,
    startTime,
    endTime
  });

  try {
    await newBlock.save();
  } catch (e) {
    logger.error(`Failed to save new block for ${ctx.state.user.rcs_id}: ${e}`);
    return ctx.badRequest('There was an error scheduling the work block.');
  }

  let assessment;
  // Get assessment
  try {
    assessment = await (assessmentType === 'assignment' ? Assignment : Exam)
      .findOne({
        _student: ctx.state.user._id,
        _id:
          // eslint-disable-next-line
          ctx.params[
            assessmentType === 'assignment' ? 'assignmentID' : 'examID'
          ]
      })
      .populate('_blocks');
  } catch (e) {
    logger.error(
      `Failed to get assignment to add new work block for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.internalServerError(
      'There was an error getting the assignment.'
    );
  }

  assessment._blocks.push(newBlock);

  try {
    await assessment.save();
  } catch (e) {
    logger.error(
      `Failed to save assessment with new work block for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('There was an error scheduling the work block.');
  }

  logger.info(`Adding work block for ${ctx.state.user.rcs_id}`);

  return ctx.ok({
    // eslint-disable-next-line standard/computed-property-even-spacing
    ['updated' +
    (assessmentType === 'assignment' ? 'Assignment' : 'Exam')]: assessment
  });
}

/**
 * Edit a work block by changing the start and end times.
 * The request body should contain:
 * - startTime
 * - endTime
 * - assessmentTyoe
 *
 * @param {Koa context} ctx
 * @returns Updated assessment
 *
 * PATCH /:blockID
 */
async function editWorkBlock (ctx) {
  const { startTime, endTime, assessmentType } = ctx.request.body;
  const blockID = ctx.params.blockID;

  const editedBlock = await Block.findOne({
    _student: ctx.state.user._id,
    _id: blockID
  });

  editedBlock.set({ startTime, endTime });

  try {
    await editedBlock.save();
  } catch (e) {
    logger.error(
      `Failed to edit work block for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('There was an error updatng the work block.');
  }

  let assessment;
  // Get assessment
  try {
    assessment = await (assessmentType === 'assignment' ? Assignment : Exam)
      .findOne({
        _student: ctx.state.user._id,
        _id:
          // eslint-disable-next-line
          ctx.params[
            assessmentType === 'assignment' ? 'assignmentID' : 'examID'
          ]
      })
      .populate('_blocks');
  } catch (e) {
    logger.error(
      `Failed to get assessment for work block edit for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.internalServerError(
      'There was an error editing the work block.'
    );
  }

  logger.info(`Edited work block for ${ctx.state.user.rcs_id}`);

  return ctx.ok({
    // eslint-disable-next-line standard/computed-property-even-spacing
    ['updated' +
    (assessmentType === 'assignment' ? 'Assignment' : 'Exam')]: assessment
  });
}

/**
 * Remove a work block given its ID
 * @param {Koa context} ctx
 * @returns Removed block
 *
 * DELETE /:blockID
 */
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
