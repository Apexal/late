const logger = require('../logger');
const { scrapeSISForCRNS } = require('../scraping');
const { getSectionInfoFromCRN } = require('../yacs_api');

/**
 * When the user navigates to `/setup`, determine what they have
 * not set up yet and redirect them to that. If everything is setup,
 * send a flash message and redirect them to `/`.
 **/
async function getSetupIndex(ctx) {
  if (ctx.state.user.next_to_setup)
    return ctx.redirect(`/setup/${ctx.state.user.next_to_setup}`);
  ctx.request.flash('warning', 'You are already totally setup!');
  ctx.redirect('/');
}

async function getPersonalInfoSetup(ctx) {
  ctx.state.title = 'Setup Personal Info';
  await ctx.render('setup/personal_info');
}

async function postPersonalInfoSetup(ctx) {
  const body = ctx.request.body;
  console.log(body);

  // TODO: validate RIN
  ctx.state.user.rin = body.rin;

  ctx.state.user.name.first = body.first_name;
  ctx.state.user.name.last = body.last_name;

  ctx.state.user.grad_year = parseInt(body.grad_year);

  ctx.state.user.setup.personal_info = true;

  await ctx.state.user.save();

  ctx.request.flash('success', 'Saved personal info.');

  ctx.redirect('/setup');
}

async function getCourseScheduleSetup(ctx) {
  ctx.state.title = 'Setup Course Schedule';
  await ctx.render('setup/course_schedule');
}

async function postCourseScheduleSetup(ctx) {
  // Determine method chosen (CRNs or SIS)
  const body = ctx.request.body;

  logger.info(`Getting schedule info for ${ctx.state.user.rcs_id}`);

  const CRNs = body.pin
    ? await scrapeSISForCRNS(ctx.state.user.rin, body.pin, '201809')
    : body.crns.split(',').map(crn => crn.trim());

  let course_schedule = await Promise.all(CRNs.map(getSectionInfoFromCRN));

  // Remove courses that YACS could not find
  course_schedule = course_schedule.filter(course => !!course);

  ctx.state.user.course_schedule = course_schedule;
  ctx.state.user.setup.course_schedule = true;

  ctx.request.flash('success', 'Your course schedule was successfully setup!');

  await ctx.state.user.save();

  ctx.redirect('/setup');
}

module.exports = {
  getSetupIndex,
  getPersonalInfoSetup,
  postPersonalInfoSetup,
  getCourseScheduleSetup,
  postCourseScheduleSetup
};
