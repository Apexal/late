const logger = require('../../modules/logger');
const moment = require('moment');

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

/**
 * Create a new term.
 *
 * @param {Koa session} ctx
 *
 * GET /
 **/
async function createTerm (ctx) {
  if (!ctx.state.user.admin) return ctx.unauthorized('Only admins can add terms.');

  const { name, code, start, classesEnd, end } = ctx.request.body;

  const createdTerm = new Term({
    name,
    code,
    start,
    classesEnd,
    end
  });

  if (
    moment(end).isSameOrBefore(start) ||
    moment(classesEnd).isSameOrBefore(start) ||
    moment(classesEnd).isAfter(end)
  ) {
    logger.error('Failed to add new term: Date are out of order.');
    return ctx.badRequest('The date are out of order!');
  }

  try {
    await createdTerm.save();
  } catch (e) {
    logger.error(
      `Failed to get create term for admin ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.internalServerError('There was an error creating the term.');
  }

  logger.info(
    `Created term ${createdTerm.name} for admin ${ctx.state.user.rcs_id}.`
  );

  ctx.ok({ createdTerm });
}

module.exports = {
  getTerms,
  createTerm
};
