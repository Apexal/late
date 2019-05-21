const QuickLink = require('./quicklinks.model');
const logger = require('../../modules/logger');

/**
 * Fetches the list of all CONFIRMED quick links.
 * @param {Koa context} ctx
 * @retuns A JSON list of quicklinks
 */
async function getQuickLinks (ctx) {
  const quickLinks = await QuickLink.find({ confirmed: true });
  return ctx.ok({ quickLinks });
}

/**
 * Creates a new quick link.
 * Request body:
 *  - title
 *  - url
 *  - description (optional)
 * @param {Koa context} ctx
 */
async function createQuickLink (ctx) {
  const { title, description, url } = ctx.request.body;
  const createdQuickLink = QuickLink({
    _student: ctx.state.user._id,
    title,
    description,
    url,
    confirmed: false
  });
  try {
    await createdQuickLink.save();
  } catch (e) {
    logger.error(
      `Failed to save new quick link for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('There was an error adding the quick link.');
  }

  logger.info(`Added quick link for ${ctx.state.user.rcs_id}`);
  return ctx.created({ createdQuickLink });
}

/**
 * Deletes a quick link given its ID.
 * Request parameters:
 *  - quickLinkID: the quick link ID
 * @param {Koa context} ctx
 */
async function deleteQuickLink (ctx) {
  const { quickLinkID } = ctx.params;
  const deletedQuickLink = await QuickLink.findOne({
    _id: quickLinkID
  });

  deletedQuickLink.remove();

  logger.info(`Deleted quick link for ${ctx.state.user.rcs_id}`);
  ctx.ok({ deletedQuickLink });
}

module.exports = {
  getQuickLinks,
  createQuickLink,
  deleteQuickLink
};
