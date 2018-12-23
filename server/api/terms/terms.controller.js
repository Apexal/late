const logger = require('../../modules/logger');

const Term = require('./terms.model');

/**
 * Get all terms.
 *
 * @param {Koa session} ctx
 *
 * GET /
 **/
async function getTerms (ctx) {
  let terms;

  try {
    terms = await Term.find().sort({ startTime: -1 });
  } catch (e) {
    logger.error(`Failed to get all terms for ${ctx.state.user.rcs_id}: ${e}`);
    return ctx.internalServerError(
      'There was an error getting the list of terms.'
    );
  }

  ctx.ok({ terms });
}

module.exports = {
  getTerms
};
