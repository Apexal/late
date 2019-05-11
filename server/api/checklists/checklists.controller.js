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
    logger.error(`Failed to get checklists for ${(ctx.state.user ? ctx.state.user.rcs_id : 'guest')}: ${e}`);
    return ctx.internalServerError('There was an issue getting the checklists.');
  }

  logger.info('Sending checklists to ' + (ctx.state.user ? ctx.state.user.rcs_id : 'guest'));

  ctx.ok({
    checklists
  });
}

async function getChecklist (ctx) {

}

async function createChecklist (ctx) {

}

async function updateChecklist (ctx) {

}

async function deleteChecklist (ctx) {

}

module.exports = {
  getChecklists,
  getChecklist,
  createChecklist,
  updateChecklist,
  deleteChecklist
};
