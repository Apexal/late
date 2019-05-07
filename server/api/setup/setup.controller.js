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
    return ctx.badRequest('Invalid SIS credentials!');
  }

  // Set course types for each course
  try {
    courseSchedule = await scrapePeriodTypesFromCRNs(
      termCode,
      courseSchedule
    );
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


  // If reimporting, update old list but keep longnames and colors

  // Already previously imported
  const promises = courseSchedule.map(async course => {
    // Look for match in old schedule
    let courseDoc = await Course.findOne({ _student: ctx.state.user._id, termCode, crn: course.crn });

    if (courseDoc) {
      Object.assign(course, {
        title: course.title,
        color: course.color,
        links: course.links || []
      });
    } else {
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
    // eslint-disable-next-line standard/computed-property-even-spacing
    ctx.state.user.semester_schedules[
      ctx.session.currentTerm.code
    ] = updatedCourses;
    ctx.state.user.markModified('semester_schedules');
    await ctx.state.user.save();
  } catch (e) {
    logger.error(
      `Failed to set update courses for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('Failed to update your courses.');
  }

  logger.info(`Updated courses for ${ctx.state.user.rcs_id}`);

  ctx.ok({ updatedUser: ctx.state.user });
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

  ctx.state.user.setup.unavailability.push(ctx.session.currentTerm.code);

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
  setPersonalInfo,
  setCourseSchedule,
  setCourses,
  setTimePreference,
  setGoogle
};
