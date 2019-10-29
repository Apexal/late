const QuickLink = require('./quicklinks.model')
const logger = require('../../modules/logger')

/**
 * Fetches the list of all CONFIRMED quick links.
 * @param {Koa context} ctx
 * @retuns A JSON list of quicklinks
 */
async function getQuickLinks (ctx) {
  const quickLinks = await QuickLink.find().populate('_student', 'rcs_id')
  return ctx.ok({ quickLinks })
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
  const { category, title, description, url } = ctx.request.body
  const createdQuickLink = QuickLink({
    category,
    title,
    description,
    url
  })
  if (ctx.state.user) {
    createdQuickLink._student = ctx.state.user._id
    createdQuickLink.confirmed = ctx.state.user.admin // if user is admin, don't have to confirm
  }
  try {
    await createdQuickLink.save()
  } catch (e) {
    logger.error(
      `Failed to save new quick link for ${
        ctx.state.user ? ctx.state.user.rcs_id : 'anonymous'
      }: ${e}`
    )
    return ctx.badRequest('There was an error adding the quick link.')
  }

  logger.info(
    `Added quick link for ${
      ctx.state.user ? ctx.state.user.rcs_id : 'anonymous'
    }`
  )
  return ctx.created({ createdQuickLink })
}

/**
 * Update a quick link with whatever properties are in the request body.
 *
 * @param {Koa context} ctx
 */
async function updateQuickLink (ctx) {
  if (!ctx.state.user.admin) return ctx.forbidden('You are not an admin!')

  const { quickLinkID } = ctx.params
  const updatedQuickLink = await QuickLink.findOne({
    _id: quickLinkID
  })

  delete ctx.request.body._id

  Object.assign(updatedQuickLink, ctx.request.body)
  await updatedQuickLink.save()

  logger.info(`Updated quick link for ${ctx.state.user.identifier}`)

  return ctx.ok({ updatedQuickLink })
}

/**
 * Deletes a quick link given its ID.
 * Request parameters:
 *  - quickLinkID: the quick link ID
 * @param {Koa context} ctx
 */
async function deleteQuickLink (ctx) {
  if (!ctx.state.user.admin) return ctx.forbidden('You are not an admin!')

  const { quickLinkID } = ctx.params
  const deletedQuickLink = await QuickLink.findOne({
    _id: quickLinkID
  })

  if (!deletedQuickLink) {
    return ctx.notFound('No quick link could be found matching this criteria.')
  }

  deletedQuickLink.remove()
  logger.info(`Deleted quick link for ${ctx.state.user.identifier}`)
  ctx.ok({ deletedQuickLink })
}

module.exports = {
  getQuickLinks,
  createQuickLink,
  updateQuickLink,
  deleteQuickLink
}
