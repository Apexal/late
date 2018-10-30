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

/**
 * Render the form for inputting personal info.
 */
async function getPersonalInfoSetup(ctx) {
  ctx.state.title = 'Setup Personal Info';
  await ctx.render('setup/personal_info');
}

/**
 * Given the data from the personal info form,
 * update the student object in the database.
 */
async function postPersonalInfoSetup(ctx) {
  const body = ctx.request.body;
  console.log(body);

  // TODO: validate RIN
  ctx.state.user.rin = body.rin;

  ctx.state.user.name.first = body.first_name;
  ctx.state.user.name.last = body.last_name;

  ctx.state.user.grad_year = parseInt(body.grad_year);

  ctx.state.user.setup.personal_info = true;

  try {
    await ctx.state.user.save();
    ctx.request.flash('success', 'Saved personal info.');

    ctx.redirect('/setup'); // Redirects to next setup step
  } catch(err) {
    ctx.request.flash('danger', 'Failed to save personal info. Some fields contain errors.');
    ctx.redirect('back');
  }
}

/**
 *  Render the course schedule setup page
 */
async function getCourseScheduleSetup(ctx) {
  ctx.state.title = 'Setup Course Schedule';
  await ctx.render('setup/course_schedule');
}

/**
 * Given either a student's SIS PIN or CRNs from the course setup page,
 * use the proper API or web scraper to grab schedule and period info
 * and save it as the student's schedule in the database.
 */
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

  course_schedule.push({
    longname: 'Other',
    crn: '00000',
    periods: []
  });

  ctx.state.user.setup.course_schedule = true;
  ctx.state.user.current_schedule = course_schedule;

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
