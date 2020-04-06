const Announcement = require('./announcements.model')
const logger = require('../../modules/logger')

const { findOneOr404 } = require('../utils')

/**
 * Fetches all announcements.
 *
 * **Response JSON**
 * - announcements: array of Announcement objects sorted by creation date
 */
module.exports.getAnnouncements = async function (ctx) {
  const announcements = await Announcement.find({})
    .populate('_student')
    .sort('-createdAt')
  return ctx.ok({ announcements })
}

/**
 * Creates a new announcement.
 *
 * **Request Body**
 * - title: title of the announcement
 * - body: the announcement text
 * - isPinned (optional): whether or not to pin the announcement
 *
 * **Response JSON**
 * - createdAnnouncement: the created Announcement document
 */
module.exports.createAnnouncement = async function (ctx) {
  // Only admins can add announcements
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!')
  }

  const { title, body, isPinned } = ctx.request.body
  const createdAnnouncement = Announcement({
    _student: ctx.state.user._id,
    title,
    body,
    isPinned
  })
  try {
    await createdAnnouncement.save()
  } catch (e) {
    logger.error(
      `Failed to save new announcement for ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.badRequest('There was an error adding the announcement.')
  }

  logger.info(`Added announcement for ${ctx.state.user.identifier}`)
  return ctx.created({ createdAnnouncement })
}

/**
 * Edits an existing announcement.
 *
 * **Request Body**
 * - title: title of the announcement
 * - body: the announcement text
 * - isPinned (optional): whether or not to pin the announcement
 *
 * **Response JSON**
 * - updatedAnnouncement: the updated Announcement document
 */
module.exports.editAnnouncement = async function (ctx) {
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!')
  }
  const { announcementID } = ctx.params
  const { body } = ctx.request

  const updatedAnnouncement = await findOneOr404(ctx, Announcement.findById(announcementID))

  if ('title' in body) updatedAnnouncement.title = body.title
  if ('body' in body) updatedAnnouncement.body = body.body
  if ('isPinned' in body) updatedAnnouncement.isPinned = body.isPinned

  try {
    await updatedAnnouncement.save()
  } catch (e) {
    logger.error(
      `Failed to save new announcement for ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.badRequest('There was an error editing the announcement.')
  }

  logger.info(`Edited announcement for ${ctx.state.user.identifier}`)
  return ctx.ok({ updatedAnnouncement })
}

/**
 * Deletes an announcement given its ID.
 *
 * **Request Body**
 * - announcementID: the target Announcement's ObjectID
 *
 * **Response JSON**
 * - deletedAnnouncement: the deleted Announcement document
 */
module.exports.deleteAnnouncement = async function (ctx) {
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!')
  }
  const { announcementID } = ctx.params

  const deletedAnnouncement = await findOneOr404(ctx, Announcement.findOne({
    _id: announcementID
  }))

  await deletedAnnouncement.remove()

  logger.info(`Deleted announcement ${announcementID} for ${ctx.state.user.identifier}`)
  ctx.ok({ deletedAnnouncement })
}
