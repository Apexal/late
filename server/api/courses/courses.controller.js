const Course = require('./courses.model');
const logger = require('../../modules/logger');

/**
 * Fetches the current student's course list for the current term.
 * @param {Koa context} ctx
 * @retuns A JSON list of unavailability blocks
 */
async function getCourses (ctx) {
  const courses = await Course.find({
    _student: ctx.state.user._id,
    termCode: ctx.session.currentTerm.code
  }).sort('longname');

  logger.info(`Sending courses to ${ctx.state.user.rcs_id}`);

  return ctx.ok({ courses });
}

module.exports = {
  getCourses
};
