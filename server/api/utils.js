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
