const logger = require('../modules/logger')

/**
 * Inspired by Django, given a Mongoose Query to find ONE document with any middleware such as .select(), .where(), etc.
 * If the document is not found, it responds to the request with a 404.
 *
 * @param ctx Koa context
 * @param Query Mongoose Query
 * @returns Found document if exists
 * @throws 404 If document not found
 */
module.exports.findOneOr404 = async function (ctx, Query) {
  const document = await Query
  if (!document) {
    logger.error(`Could not find ${Query.model.modelName} for ${ctx.state.user ? ctx.state.user.identifier : 'unauthenticated user'}`)
    return ctx.throw(404, `Could not find ${Query.model.modelName} document.`)
  }
  return document
}

/**
 * Middleware to prevent access to a route if the current user is on break.
 */
module.exports.notOnBreakMiddleware = async function notOnBreak (ctx, next) {
  if (ctx.state.onBreak && !ctx.request.url.includes('/term/')) {
    logger.error(`${ctx.state.user.identifier} tried to access '${ctx.request.url}' on break`)
    return ctx.badRequest('You are on break!')
  }
  return next()
}

/**
 * Middleware to prevent access to a route if the current user is not an admin.
 */
module.exports.adminMiddleware = async function adminMiddleware (ctx, next) {
  if (!ctx.state.user.admin) {
    logger.error(`${ctx.state.user.identifier} tried to access admin route '${ctx.request.url}'`)
    return ctx.unauthorized('You are not an admin!')
  }
  return next()
}
