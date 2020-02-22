const logger = require('../../modules/logger')
const moment = require('moment')

const Term = require('./terms.model')

/**
 * Get all terms.
 *
 * @param {Koa session} ctx
 *
 * GET /
 **/
async function getTerms (ctx) {
  let terms

  try {
    terms = await Term.find().sort({ startDate: -1 })
  } catch (e) {
    logger.error(`Failed to get all terms for ${ctx.state.user.identifier}: ${e}`)
    return ctx.internalServerError(
      'There was an error getting the list of terms.'
    )
  }

  ctx.ok({ terms })
}

/**
 * Create a new term.
 *
 * @param {Koa session} ctx
 *
 * GET /
 **/
async function createTerm (ctx) {
  if (!ctx.state.user.admin) return ctx.forbidden('Only admins can add terms.')

  const { name, code, start, classesEnd, end } = ctx.request.body

  const createdTerm = new Term({
    name,
    code,
    start,
    classesEnd,
    end
  })

  if (
    moment(end).isSameOrBefore(start) ||
    moment(classesEnd).isSameOrBefore(start) ||
    moment(classesEnd).isAfter(end)
  ) {
    logger.error('Failed to add new term: Date are out of order.')
    return ctx.badRequest('The date are out of order!')
  }

  try {
    await createdTerm.save()
  } catch (e) {
    logger.error(
      `Failed to get create term for admin ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.internalServerError('There was an error creating the term.')
  }

  ctx.session.terms.push(createdTerm)

  logger.info(
    `Created term ${createdTerm.name} for admin ${ctx.state.user.identifier}.`
  )

  ctx.ok({ createdTerm })
}

async function updateTerm (ctx) {
  if (!ctx.state.user.admin) return ctx.forbidden('Only admins can update terms.')

  const { termID } = ctx.params

  let updatedTerm
  try {
    updatedTerm = await Term.findById(termID)
  } catch (e) {
    logger.error(`Failed to find term to update for ${ctx.state.user.identifier}: ${e}`)
    return ctx.notFound(`Could not find term with ID ${termID}`)
  }

  updatedTerm.set(ctx.request.body)

  try {
    await updatedTerm.save()
  } catch (e) {
    logger.error(`Failed to save updates for term ${updatedTerm.name}: ${e}`)
    return ctx.badRequest('Could not save updates to term.')
  }

  logger.info(`${ctx.state.user.identifier} updated term ${updateTerm.name}`)

  return ctx.ok({ updatedTerm })
}

module.exports = {
  getTerms,
  createTerm,
  updateTerm
}
