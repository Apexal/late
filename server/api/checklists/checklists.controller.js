const Checklist = require('./checklists.model');
const logger = require('../../modules/logger');

/**
 * Get all non-private checklists.
 *
 * @param {Koa context} ctx
 */
async function getChecklists (ctx) {
  let checklists;
  try {
    checklists = await Checklist.find({ private: false }).sort('createdAt');
  } catch (e) {
    logger.error(
      `Failed to get checklists for ${
        ctx.state.user ? ctx.state.user.rcs_id : 'guest'
      }: ${e}`
    );
    return ctx.internalServerError(
      'There was an issue getting the checklists.'
    );
  }

  logger.info(
    'Sending checklists to ' +
      (ctx.state.user ? ctx.state.user.rcs_id : 'guest')
  );

  ctx.ok({
    checklists
  });
}

async function getChecklist (ctx) {
  const { checklistID } = ctx.params;

  let checklist;
  try {
    checklist = await Checklist.findOne({
      _id: checklistID,
      _student: ctx.state.user._id
    });
  } catch (e) {
    logger.error(`Failed to get checklist for ${ctx.state.user.rcs_id}: ${e}`);
    return ctx.badRequest('Could not find the checklist!');
  }

  logger.info(`Sending checklist to ${ctx.state.user.rcs_id}`);

  ctx.ok({
    checklist
  });
}

async function createChecklist (ctx) {}

async function updateChecklist (ctx) {
  const { checklistID } = ctx.params;

  let updatedChecklist;
  try {
    updatedChecklist = await Checklist.findOne({
      _id: checklistID,
      _student: ctx.state.user._id
    });
  } catch (e) {
    logger.error(`Failed to get checklist for ${ctx.state.user.rcs_id}: ${e}`);
    return ctx.badRequest('Could not find the checklist!');
  }

  delete ctx.request.body._id;
  Object.assign(updateChecklist, ctx.request.body);

  try {
    await updatedChecklist.save();
  } catch (e) {
    logger.error(
      `Failed to updated checklist for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.internalServerError('Failed to update the checklist!');
  }

  logger.info(
    `Saved checklist ${updatedChecklist._id} for ${ctx.state.user.rcs_id}`
  );

  return ctx.ok({
    updatedChecklist
  });
}

async function removeChecklist (ctx) {}

module.exports = {
  getChecklists,
  getChecklist,
  createChecklist,
  updateChecklist,
  removeChecklist
};
