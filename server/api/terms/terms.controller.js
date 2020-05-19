const logger = require('../../modules/logger')
const moment = require('moment')
const { findOneOr404 } = require('../utils')
const Term = require('./terms.model')

/**
 * Get all terms sorted in descending order of start date.
 *
 * **Response JSON**
 * - terms: array of sorted Term documents
 **/
module.exports.getTerms = async function (ctx) {
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
 * Create a new term from data in the request body.
 *
 * **Request Body**
 * - name: string name of term, e.g. 'Fall 2019'
 * - code: string term code from SIS, e.g. '202001'
 * - startDate: date of first day of term
 * - endDate: date of last day of term
 * - classesEndDate: date of lass class day before finals
 *
 * **Response JSON**
 * - createdTerm: the created Term document
 **/
module.exports.createTerm = async function (ctx) {
  if (!ctx.state.user.admin) return ctx.forbidden('Only admins can add terms.')

  const { name, code, startDate, classesEndDate, endDate } = ctx.request.body

  const createdTerm = new Term({
    name,
    code,
    startDate,
    classesEndDate,
    endDate
  })

  // Ensure the order is startDate, classesEndDate, endDate
  if (
    moment(endDate).isSameOrBefore(startDate) ||
    moment(classesEndDate).isSameOrBefore(startDate) ||
    moment(classesEndDate).isAfter(endDate)
  ) {
    logger.error('Failed to add new term: Dates are out of order.')
    return ctx.badRequest('The dates are out of order!')
  }

  // Attempt to save the new term. This might fail if the request body's values are missing or invalid.
  try {
    await createdTerm.save()
  } catch (e) {
    logger.error(
      `Failed to get create term for admin ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.internalServerError('There was an error creating the term.')
  }

  // Add this new term to the session array
  ctx.session.terms.push(createdTerm)

  logger.info(
    `Created term ${createdTerm.name} for admin ${ctx.state.user.identifier}.`
  )

  ctx.ok({ createdTerm })
}

/**
 * Update a term with ID specified by paramter termID with data in request body. Admins only.
 *
 * **Request Body**
 * - *term object properties*
 *
 * **Response JSON**
 * - updatedTerm: the updated Term document
 */
module.exports.updateTerm = async function (ctx) {
  if (!ctx.state.user.admin) return ctx.forbidden('Only admins can update terms.')

  const { termID } = ctx.params

  // Attempt to find the term by its ID
  const updatedTerm = await findOneOr404(ctx, Term.findById(termID))

  // Update the term by applying the values in request body to it
  updatedTerm.set(ctx.request.body)

  // Attempt to save the term. This might fail if the request body passed invalid values.
  try {
    await updatedTerm.save()
  } catch (e) {
    logger.error(`Failed to save updates for term ${updatedTerm.name}: ${e}`)
    return ctx.badRequest('Could not save updates to term.')
  }

  // Update terms in the session
  ctx.session.terms = await Term.find().exec()

  logger.info(`${ctx.state.user.identifier} updated term ${updatedTerm.name}`)

  return ctx.ok({ updatedTerm })
}
