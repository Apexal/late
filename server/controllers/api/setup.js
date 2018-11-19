const moment = require('moment');

const logger = require('../../logger');
const { scrapeSISForCRNS } = require('../../scraping');
const { getSectionInfoFromCRN } = require('../../yacs_api');

/**
 * Given personal info in the request body:
 * - first_name
 * - last_name
 * - rin
 * - grad_year
 * Save it to the logged in user.
 *
 * @param {Koa context} ctx
 */
async function setPersonalInfo (ctx) {
  const body = ctx.request.body;

  // TODO: validate RIN
  ctx.state.user.rin = body.rin;
  ctx.state.user.name.first = body.first_name;
  ctx.state.user.name.last = body.last_name;

  ctx.state.user.grad_year = parseInt(body.grad_year);

  ctx.state.user.setup.personal_info = true;

  try {
    await ctx.state.user.save();

    logger.info(`Saved personal info for ${ctx.state.user.rcs_id}`);
    ctx.ok({
      updatedUser: ctx.state.user
    });
  } catch (err) {
    logger.error(
      `Failed to save personal info for ${ctx.state.user.rcs_id}: ${err}`
    );
    ctx.badRequest({
      err
    });
  }
}

/**
 * Given the following data in the request body:
 * - SIS PIN as sis_pin
 *  OR
 * - Period CRNs as crns
 * Set the user's course schedule using the YACS API and possibly SIS scraping.
 *
 * @param {Koa context} ctx
 */
async function setCourseSchedule (ctx) {
  const body = ctx.request.body;

  logger.info(`Setting schedule info for ${ctx.state.user.rcs_id}`);

  const CRNs = body.pin
    ? await scrapeSISForCRNS(ctx.state.user.rin, body.pin, '201809')
    : body.crns.split(',').map(crn => crn.trim());

  let courseSchedule = await Promise.all(CRNs.map(getSectionInfoFromCRN));

  // Remove courses that YACS could not find
  courseSchedule = courseSchedule.filter(course => !!course);

  courseSchedule.push({
    longname: 'Other',
    crn: '00000',
    periods: []
  });

  for (let c in courseSchedule) {
    courseSchedule[c].color =
      '#' +
      Math.random()
        .toString(16)
        .substr(-6);
  }
  ctx.state.user.setup.course_schedule = true;

  try {
    ctx.state.user.current_schedule = courseSchedule;
    await ctx.state.user.save();
    ctx.ok({ updatedUser: ctx.state.user });
  } catch (error) {
    ctx.badRequest({ error });
    logger.error(
      `Failed to set course schedule for ${ctx.state.user.rcs_id}: ${error}`
    );
  }
}

/**
 * Set the logged in user's courses and return the updated user.
 * Request body:
 *  - courses: array of objects with the same schema as current_schedule
 *
 * @param {Koa context} ctx
 */
async function setCourses (ctx) {
  const body = ctx.request.body;
  const updatedCourses = body.courses;

  try {
    ctx.state.user.current_schedule = updatedCourses;
    await ctx.state.user.save();
    ctx.ok({ updatedUser: ctx.state.user });
  } catch (error) {
    logger.error(
      `Failed to set custom courses for ${ctx.state.user.rcs_id}: ${error}`
    );
    ctx.badRequest('Failed to set custom courses.');
  }
}

/**
 * Set the work schedule of the logged in user.
 *
 * Body:
 * - events
 * @param {Koa context} ctx
 */
async function setWorkSchedule (ctx) {
  const events = ctx.request.body.events;

  // Remove dates, split times
  const workPeriods = events.map(e => ({
    day: moment(e.start).day(),
    start: moment(e.start).format('Hmm'),
    end: moment(e.end).format('Hmm')
  }));

  ctx.state.user.setup.work_schedule = true;

  try {
    ctx.state.user.current_work_schedule = workPeriods;
    await ctx.state.user.save();
    logger.info(`Set work/study periods for ${ctx.state.user.rcs_id}`);
    ctx.ok({ updatedUser: ctx.state.user });
  } catch (error) {
    ctx.badRequest({ error });
    logger.error(
      `Failed to set work/study schedule for ${ctx.state.user.rcs_id}: ${error}`
    );
  }
}

module.exports = {
  setPersonalInfo,
  setCourseSchedule,
  setCourses,
  setWorkSchedule
};
