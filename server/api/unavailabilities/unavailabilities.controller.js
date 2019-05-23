const Unavailability = require('./unavailabilities.model');
const logger = require('../../modules/logger');

/**
 * Fetches all of the Unavailability blocks for the current term.
 * @param {Koa context} ctx
 * @retuns A JSON list of unavailability blocks
 */
async function getUnavailabilities (ctx) {
  const unavailabilities = await Unavailability.find({
    _student: ctx.state.user._id
  });
  return ctx.ok({ unavailabilities });
}

/**
 * Saves a new unavailability block.
 * Request body:
 *  - title: the event text
 *  - start
 *  - end
 *  - dow
 *  - isOneTime
 * @param {Koa context} ctx
 */
async function createUnavailability (ctx) {
  const { title, start, end, dow, isOneTime } = ctx.request.body;
  const unavailability = Unavailability({
    _student: ctx.state.user._id,
    termCode: ctx.session.currentTerm.code,
    title,
    dow,
    start,
    end,
    isOneTime
  });

  if (
    !ctx.state.user.setup.unavailability.includes(ctx.session.currentTerm.code)
  ) {
    ctx.state.user.setup.unavailability.push(ctx.session.currentTerm.code);
  }

  try {
    await unavailability.save();
  } catch (e) {
    logger.error(
      `Failed to save new unavailability block for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('There was an error adding the unavailability.');
  }

  logger.info(`Added unavailability block for ${ctx.state.user.rcs_id}`);
  return ctx.created({
    updatedUser: ctx.state.user,
    createdUnavailability: unavailability
  });
}

/**
 * Update an unavailability block.
 * Request body:
 *  - any properties to patch the block with (excluding _id)
 * @param {Koa context} ctx
 */
async function updateUnavailability (ctx) {
  if ('_id' in ctx.request.body || '_student' in ctx.request.body) {
    return ctx.badRequest();
  }
  const { unavailabilityID } = ctx.params;

  let updatedUnavailability;
  try {
    updatedUnavailability = await Unavailability.findOne({
      _id: unavailabilityID,
      _student: ctx.state.user._id
    });

    updateUnavailability.set(ctx.request.body);

    await updatedUnavailability.save();
  } catch (e) {
    logger.error(
      `Failed to update unavailability block for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('There was an error updating your unavailability.');
  }

  logger.info(`Updated unavailability block for ${ctx.state.user.rcs_id}`);
  return ctx.created({ updatedUnavailability });
}

/**
 * Deletes a unavailability given its ID.
 * Request parameters:
 *  - unavailabilityID: the unavailability block ID
 * @param {Koa context} ctx
 */
async function removeUnavailability (ctx) {
  const { unavailabilityID } = ctx.params;
  const deletedUnavailability = await Unavailability.findOne({
    _id: unavailabilityID,
    _student: ctx.state.user._id
  });

  deletedUnavailability.remove();

  logger.info(`Deleted unavailability block for ${ctx.state.user.rcs_id}`);
  ctx.ok({ deletedUnavailability });
}

module.exports = {
  getUnavailabilities,
  createUnavailability,
  updateUnavailability,
  removeUnavailability
};
