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
  const user = await ctx.db.Student.findOne()
    .byUsername(ctx.session.cas_user.toLowerCase())
    .exec();

  // TODO: validate RIN
  user.rin = body.rin;
  user.name.first = body.first_name;
  user.name.last = body.last_name;

  user.grad_year = parseInt(body.grad_year);

  user.setup.personal_info = true;

  try {
    await user.save();

    logger.info(`Saved personal info for ${user.rcs_id}`);
    ctx.ok({
      updatedUser: user
    });
  } catch (err) {
    logger.error(`Failed to save personal info for ${user.rcs_id}: ${err}`);
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
  const user = await ctx.db.Student.findOne()
    .byUsername(ctx.session.cas_user.toLowerCase())
    .exec();

  logger.info(`Setting schedule info for ${user.rcs_id}`);

  const CRNs = body.pin
    ? await scrapeSISForCRNS(user.rin, body.pin, '201809')
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
  user.setup.course_schedule = true;

  try {
    user.current_schedule = courseSchedule;
    await user.save();
    ctx.ok({ updatedUser: user });
  } catch (error) {
    ctx.badRequest({ error });
    logger.error(`Failed to set course schedule for ${user.rcs_id}: ${error}`);
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
  const user = await ctx.db.Student.findOne()
    .byUsername(ctx.session.cas_user.toLowerCase())
    .exec();

  const events = ctx.request.body.events;

  // Remove dates, split times
  const workPeriods = events.map(e => ({
    day: moment(e.start).day(),
    start: moment(e.start).format('Hmm'),
    end: moment(e.end).format('Hmm')
  }));

  user.setup.work_schedule = true;

  try {
    user.current_work_schedule = workPeriods;
    await user.save();
    logger.info(`Set work/study periods for ${user.rcs_id}`);
    ctx.ok({ updatedUser: user });
  } catch (error) {
    ctx.badRequest({ error });
    logger.error(
      `Failed to set work/study schedule for ${user.rcs_id}: ${error}`
    );
  }
}

module.exports = {
  setPersonalInfo,
  setCourseSchedule,
  setWorkSchedule
};
