const ical = require('node-ical');
const logger = require('../../modules/logger');
const {
  scrapeSISForCourseSchedule,
  scrapePeriodTypesFromCRNs
} = require('../../modules/scraping');
const { getSectionInfoFromCRN } = require('../../modules/yacs_api');
const { convertICalIntoCourseSchedule } = require('../../modules/ical');

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

  logger.info(`Setting schedule info for ${ctx.state.user.rcs_id}`);

  // Determine method
  const method = ctx.request.query.method;

  let courseSchedule = [];
  if (method === 'sis') {
    try {
      courseSchedule = await scrapeSISForCourseSchedule(
        ctx.state.user.rin,
        body.pin,
        ctx.session.currentTerm.code
      );
    } catch (e) {
      logger.error(
        `Failed to scrape SIS cours schedule for ${ctx.state.user.rcs_id}: ${e}`
      );
      return ctx.badRequest('Invalid SIS credentials!');
    }
  } else if (method === 'crn') {
    const CRNs = body.crns.split(',').map(crn => crn.trim());
    courseSchedule = await Promise.all(CRNs.map(getSectionInfoFromCRN));
  } else if (method === 'ical') {
    const file = ctx.request.files['ical-file'];
    if (!file) {
      return ctx.badRequest('You did not upload an .ical file!');
    }
    const cal = await ical.parseFile(file.path);
    courseSchedule = convertICalIntoCourseSchedule(cal);
  } else {
    logger.error();
    return ctx.badRequest('Invalid method.');
  }

  // Remove courses that YACS could not find
  courseSchedule = courseSchedule.filter(course => !!course);

  // Set course types for each course
  try {
    await scrapePeriodTypesFromCRNs(
      ctx.session.currentTerm.code,
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
    longname: 'Other',
    summary: 'OTHER',
    section_id: '00',
    crn: '00000',
    periods: [],
    links: []
  });

  // If reimporting, update old list but keep longnames and colors
  const oldSchedule =
    ctx.state.user.semester_schedules[ctx.session.currentTerm.code];
  if (
    oldSchedule &&
    ctx.state.user.setup.course_schedule.includes(ctx.session.currentTerm.code)
  ) {
    // Already previously imported
    for (let i in courseSchedule) {
      const course = courseSchedule[i];
      // Look for match in old schedule
      const oldMatch = oldSchedule.find(c => c.summary === course.summary);
      if (oldMatch) {
        Object.assign(course, {
          longname: oldMatch.longname,
          color: oldMatch.color,
          links: oldMatch.links || []
        });
      }
    }
  }

  for (let i in courseSchedule) {
    if (!courseSchedule[i].color) {
      courseSchedule[i].color =
        '#' +
        Math.random()
          .toString(16)
          .substr(-6);
    }
  }

  ctx.state.user.setup.course_schedule.push(ctx.session.currentTerm.code);

  try {
    // eslint-disable-next-line standard/computed-property-even-spacing
    ctx.state.user.semester_schedules[
      ctx.session.currentTerm.code
    ] = courseSchedule;
    ctx.state.user.markModified('semester_schedules');
    await ctx.state.user.save();
  } catch (e) {
    logger.error(
      `Failed to set course schedule for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('Failed to set your schedule course.');
  }

  ctx.ok({ updatedUser: ctx.state.user });
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
 * Set the study/work unavailability schedule of the logged in user.
 *
 * Body:
 * - events
 * @param {Koa context} ctx
 */
async function setUnavailability (ctx) {
  const body = ctx.request.body;
  const events = body.events;

  // Remove dates, split times
  const unavailabilityPeriods = events.map(e => ({
    dow: e.dow,
    title: e.title,
    start: e.start,
    end: e.end
  }));

  ctx.state.user.earliestWorkTime = body.earliest;
  ctx.state.user.latestWorkTime = body.latest;

  ctx.state.user.setup.unavailability.push(ctx.session.currentTerm.code);

  try {
    // eslint-disable-next-line standard/computed-property-even-spacing
    ctx.state.user.unavailability_schedules[
      ctx.session.currentTerm.code
    ] = unavailabilityPeriods;
    ctx.state.user.markModified('unavailability_schedules');
    await ctx.state.user.save();
  } catch (e) {
    logger.error(
      `Failed to set work/study unavailability schedule for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('Failed to set work/study unavailability schedule.');
  }

  logger.info(
    `Set work/study unavailability periods for ${ctx.state.user.rcs_id}`
  );
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
  setUnavailability,
  setGoogle
};
