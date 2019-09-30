const Announcement = require('./announcements.model')
const logger = require('../../modules/logger')

/**
 * Fetches all existing announcements
 * @param {Koa context} ctx
 * @retuns A JSON list of announcements
 */
async function getAnnouncements (ctx) {
  const announcements = await Announcement.find()
    .populate('_student')
    .sort('-createdAt')
  return ctx.ok({ announcements })
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

async function editAnnouncement (ctx) {
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!')
  }
  const announcementID = ctx.params.announcementID
  const body = ctx.request.body
  const updatedAnnouncement = await Announcement.findOne({
    _id: announcementID
  })

  if (!updatedAnnouncement) return ctx.notFound('Could not find announcement.')

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
 * Request parameters:
 *  - announcementID: the announcement ID
 * @param {Koa context} ctx
 */
async function deleteAnnouncement (ctx) {
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!')
  }
  const { announcementID } = ctx.params
  const deletedAnnouncement = await Announcement.findOne({
    _id: announcementID
  })

  if (!deletedAnnouncement) return ctx.notFound('Couldn\'t find the announcement!')

  deletedAnnouncement.remove()

  logger.info(`Deleted announcement for ${ctx.state.user.identifier}`)
  ctx.ok({ deletedAnnouncement })
}

module.exports = {
  getAnnouncements,
  editAnnouncement,
  createAnnouncement,
  deleteAnnouncement
}
