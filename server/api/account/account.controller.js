const logger = require('../../modules/logger');
const {
  scrapeSISForCourseSchedule,
  scrapePeriodTypesFromCRNs
} = require('../../modules/scraping');

const Course = require('../courses/courses.model');

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
async function setProfile (ctx) {
  const body = ctx.request.body;

  // TODO: validate RIN
  ctx.state.user.rin = body.rin;
  ctx.state.user.name.first = body.first_name;
  ctx.state.user.name.last = body.last_name;

  ctx.state.user.grad_year = parseInt(body.grad_year);

  ctx.state.user.setup.profile = true;

  try {
    await ctx.state.user.save();

    logger.info(`Saved personal info for ${ctx.state.user.rcs_id}`);
    return ctx.ok({
      updatedUser: ctx.state.user
    });
  } catch (err) {
    logger.error(
      `Failed to save personal info for ${ctx.state.user.rcs_id}: ${err}`
    );
    return ctx.badRequest('Failed to save personal info.');
  }
}

async function setTerms (ctx) {
  const { termCodes } = ctx.request.body;

  logger.info(`Setting terms for ${ctx.state.user.rcs_id}`);

  // Validate the termCodes
  if (
    termCodes.some(code => !ctx.session.terms.find(term => term.code === code))
  ) {
    logger.error(
      `Could not set terms for ${ctx.state.user.rcs_id}: Invalid term given.`
    );
    return ctx.badRequest(
      'Failed to set terms. You gave an invalid term code!'
    );
  }

  ctx.state.user.setup.terms = true;
  ctx.state.user.terms = termCodes.sort();

  await ctx.state.user.save();

  ctx.ok({
    updatedUser: ctx.state.user
  });
}

/**
 * Given the following data in the request body:
 * - SIS PIN as sis_pin
 *  OR
 * - Period CRNs as crns
 * Set the user's course schedule using SIS scraping.
 *
 * @param {Koa context} ctx
 */
async function importCourseSchedule (ctx) {
  const body = ctx.request.body;
  const termCode = ctx.session.currentTerm.code;

  logger.info(`Setting schedule info for ${ctx.state.user.rcs_id}`);

  let courseSchedule = [];
  try {
    courseSchedule = await scrapeSISForCourseSchedule(
      ctx.state.user.rin,
      body.pin,
      ctx.session.currentTerm,
      ctx.state.user
    );
  } catch (e) {
    logger.error(
      `Failed to scrape SIS course schedule for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest(e.message);
  }

  // Set course types for each course
  try {
    courseSchedule = await scrapePeriodTypesFromCRNs(termCode, courseSchedule);
  } catch (e) {
    logger.error(
      `Failed to scrape period types for ${ctx.state.user.rcs_id}: ${e}`
    );
    ctx.internalServerError(
      'There was an error getting the proper period types for your schedule. Please manually set them below.'
    );
  }

  // "Other" course
  courseSchedule.push({
    _student: ctx.state.user._id,
    sectionId: 0,
    originalTitle: 'Other',
    title: 'Other',
    startDate: ctx.session.currentTerm.start,
    endDate: ctx.session.currentTerm.end,
    summary: 'OTHER',
    termCode,
    crn: '00000',
    credits: 0,
    periods: [],
    links: []
  });

  // If reimporting, only update sectionId, start/end dates, credits, and periods

  const promises = courseSchedule.map(async course => {
    // Look for match in old course list
    let courseDoc = await Course.findOne({
      _student: ctx.state.user._id,
      termCode,
      crn: course.crn
    });

    if (courseDoc) {
      Object.assign(courseDoc, {
        sectionId: course.sectionId,
        startDate: course.startDate,
        endDate: course.endDate,
        credits: course.credits,
        periods: course.periods
      });
    } else {
      // Generate a random color for a new course
      course.color =
        '#' +
        Math.random()
          .toString(16)
          .substr(-6);
      courseDoc = new Course(course);
    }
    courseDoc.save();

    return courseDoc;
  });

  const courses = await Promise.all(promises);

  ctx.state.user.setup.course_schedule.push(ctx.session.currentTerm.code);

  ctx.ok({ updatedUser: ctx.state.user, courses });
}

/**
 * Set the study/work time preference of the logged in user.
 *
 * Body:
 * - events
 * @param {Koa context} ctx
 */
async function setTimePreference (ctx) {
  const body = ctx.request.body;

  ctx.state.user.earliestWorkTime = body.earliest;
  ctx.state.user.latestWorkTime = body.latest;

  if (
    !ctx.state.user.setup.unavailability.includes(ctx.session.currentTerm.code)
  ) {
    ctx.state.user.setup.unavailability.push(ctx.session.currentTerm.code);
  }

  try {
    await ctx.state.user.save();
  } catch (e) {
    logger.error(
      `Failed to set work/study time preference schedule for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('Failed to set work/study time preference schedule.');
  }

  logger.info(`Set work/study time preference for ${ctx.state.user.rcs_id}`);
  ctx.ok({ updatedUser: ctx.state.user });
}

async function setGoogle (ctx) {
  const { calendarIDs } = ctx.request.body;

  Object.assign(ctx.state.user.integrations.google.calendarIDs, calendarIDs);

  try {
    await ctx.state.user.save();
  } catch (e) {
    logger.error(
      `Failed to save Google integration settings for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('There was an error saving your Google settings.');
  }

  logger.info(`Set Google integration settings for ${ctx.state.user.rcs_id}`);
  ctx.ok({ updatedUser: ctx.state.user });
}

module.exports = {
  setProfile,
  setTerms,
  importCourseSchedule,
  setTimePreference,
  setGoogle
};
