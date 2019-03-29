const Announcement = require('./announcements.model');
const logger = require('../../modules/logger');

/**
 * Fetches all existing announcements
 * @param {Koa context} ctx
 * @retuns A JSON list of announcements
 */
async function getAnnouncements (ctx) {
  const announcements = await Announcement.find()
    .populate('_student')
    .sort('createdAt');
  return ctx.ok({ announcements });
}

/**
 * Saves a new announcement.
 * Request body:
 *  - title: title of the announcement
 *  - body: the announcement text
 *  - isPinned (optional): whether or not to pin the announcement
 * @param {Koa context} ctx
 */
async function createAnnouncement (ctx) {
  const { title, body, isPinned } = ctx.request.body;
  const createdAnnouncement = Announcement({
    _student: ctx.state.user._id,
    title,
    body,
    isPinned
  });
  try {
    await createdAnnouncement.save();
  } catch (e) {
    logger.error(
      `Failed to save new announcement for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('There was an error adding the announcement.');
  }

  logger.info(`Added announcement for ${ctx.state.user.rcs_id}`);
  return ctx.created({ createdAnnouncement });
}

/**
 * Removes an announcement given its ID.
 * Request parameters:
 *  - announcementID: the announcement ID
 * @param {Koa context} ctx
 */
async function removeAnnouncement (ctx) {
  const { announcementID } = ctx.params;
  const deletedAnnouncement = await Announcement.findOne({
    _id: announcementID,
    _student: ctx.state.user._id
  });

  deletedAnnouncement.remove();

  logger.info(`Removed announcement for ${ctx.state.user.rcs_id}`);
  ctx.ok({ deletedAnnouncement });
}

module.exports = {
  getAnnouncements,
  createAnnouncement,
  removeAnnouncement
};
