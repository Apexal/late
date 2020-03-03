const Unavailability = require('./unavailabilities.model')
const logger = require('../../modules/logger')

/**
 * Fetches all of the current user's Unavailability blocks for the current term.
 *
 * **Response JSON**
 * - unavailabilities: list of Unavailability documents
 */
module.exports.getUnavailabilities = async function getUnavailabilities (ctx) {
  const unavailabilities = await Unavailability.find({
    _student: ctx.state.user._id,
    termCode: ctx.session.currentTerm.code
  })
  return ctx.ok({ unavailabilities })
}

/**
 * Saves a new Unavailability block for the current user for the current term.
 *
 * **Request Body**
 * - title: the event title string
 * - startTime: the start time of the event in `hh:mm` format
 * - endTime: the end time of the event in `hh:mm` format
 * - daysOfWeek: list of days this block repeats on where Monday=1 ... Friday=5
 * - isOneTime: boolean if this unavailability block is just once or repeated
 *
 * **Response JSON**
 * - updatedUser:
 * - createdUnavailability:
 */
module.exports.createUnavailability = async function createUnavailability (ctx) {
  const { title, startTime, endTime, daysOfWeek, isOneTime } = ctx.request.body
  const unavailability = Unavailability({
    _student: ctx.state.user._id,
    termCode: ctx.session.currentTerm.code,
    title,
    daysOfWeek,
    startTime,
    endTime,
    isOneTime
  })

  if (
    !ctx.state.user.setup.unavailability.includes(ctx.session.currentTerm.code)
  ) {
    ctx.state.user.setup.unavailability.push(ctx.session.currentTerm.code)
  }

  try {
    await unavailability.save()
  } catch (e) {
    logger.error(
      `Failed to save new unavailability block for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.badRequest('There was an error adding the unavailability.')
  }

  logger.info(`Added unavailability block for ${ctx.state.user.identifier}`)
  return ctx.created({
    updatedUser: ctx.state.user,
    createdUnavailability: unavailability
  })
}

/**
 * Update a Unavailability block of the current user with id `unavailabilityID`.
 *
 * **Request Body**
 * - any properties to patch the block with (excluding `_id` and `_student`)
 *
 * **Response JSON**
 * - updatedUnavailability: the updated Unavailability document
 */
module.exports.updateUnavailability = async function updateUnavailability (ctx) {
  delete ctx.request.body._id
  delete ctx.request.body._student

  const { unavailabilityID } = ctx.params

  let updatedUnavailability
  try {
    updatedUnavailability = await Unavailability.findOne({
      _id: unavailabilityID,
      _student: ctx.state.user._id
    })

    if (!updatedUnavailability) {
      return ctx.notFound('No unavailability could be found that matches that criteria.')
    }

    updatedUnavailability.set(ctx.request.body)

    await updatedUnavailability.save()
  } catch (e) {
    logger.error(
      `Failed to update unavailability block for ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.badRequest('There was an error updating your unavailability.')
  }

  logger.info(`Updated unavailability block for ${ctx.state.user.identifier}`)
  return ctx.ok({ updatedUnavailability })
}

/**
 * Deletes a Unavailability of the current user with id `unavailabilityID`.
 *
 * **Response JSON**
 * - deletedUnavailability: the deleted Unavailability document
 */
module.exports.removeUnavailability = async function removeUnavailability (ctx) {
  const { unavailabilityID } = ctx.params
  const deletedUnavailability = await Unavailability.findOne({
    _id: unavailabilityID,
    _student: ctx.state.user._id
  })

  if (!deletedUnavailability) {
    return ctx.notFound('No unavailability could be found that matches that criteria.')
  }

  deletedUnavailability.remove()

  logger.info(`Deleted unavailability block for ${ctx.state.user.identifier}`)
  ctx.ok({ deletedUnavailability })
}

/**
 * Clears the current user's unavailability for the current term.
 *
 * **Response JSON**
 * - deletedUnavailabilities: list of deleted unavailability blocks
 */
module.exports.clearUnavailabilities = async function clearUnavailabilities (ctx) {
  const deletedUnavailabilities = await Unavailability.deleteMany({
    _student: ctx.state.user._id,
    termCode: ctx.session.currentTerm.code
  })

  logger.info(`Deleted all unavailabilities for ${ctx.state.user.identifier}`)
  ctx.ok({ deletedUnavailabilities })
}
