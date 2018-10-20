const logger = require('../logger');
const { scrapeSISForCRNS } = require('../scraping');
const { getSectionInfoFromCRN } = require('../yacs_api');

async function getCourseScheduleSetup(ctx) {
  ctx.state.title = 'Course Schedule Setup';
  await ctx.render('setup/course_schedule');
}

async function postCourseScheduleSetup(ctx) {
  // Determine method chosen (CRNs or SIS)
  const body = ctx.request.body;

  logger.info(`Getting schedule info for ${ctx.state.user.rcs_id}`);

  const CRNs = body.pin
    ? await scrapeSISForCRNS(ctx.state.user.rin, body.pin, '201809')
    : body.crns.split(',').map(crn => crn.trim());

  const course_schedule = await Promise.all(CRNs.map(getSectionInfoFromCRN));

  ctx.state.user.course_schedule = course_schedule;

  await ctx.state.user.save();

  ctx.redirect('/');
}

module.exports = { getCourseScheduleSetup, postCourseScheduleSetup };
