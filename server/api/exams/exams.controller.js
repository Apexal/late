const moment = require('moment');
const logger = require('../../modules/logger');

const Exam = require('./exams.model');

/**
 * Returns a list of all exams with optional filters.
 * start and end are optional URL query options in YYYY-MM-DD format.
 *
 * GET /exams
 * @param {Koa context} ctx
 */
async function getExams (ctx) {
  let exams;

  try {
    exams = await ctx.state.user.getExams(ctx.query.start, ctx.query.end);
  } catch (e) {
    logger.error(`Failed to send exams to ${ctx.state.user.rcs_id}: ${e}`);
    return ctx.internalServerError('There was an error loading your exams.');
  }

  logger.info(`Sending exams to ${ctx.state.user.rcs_id}`);

  ctx.ok({
    exams
  });
}

module.exports = {
  getExams
};
