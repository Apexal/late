const logger = require('../../modules/logger');
const {
  scrapeSISForRegisteredTerms,
  scrapeSISForProfileInfo,
  scrapeSISForCourseSchedule,
  scrapePeriodTypesFromCRNs
} = require('../../modules/scraping');

const colorThemes = require('../../modules/color_themes');

const Term = require('../terms/terms.model');
const Course = require('../courses/courses.model');

const generateOtherCourse = (user, term) => ({
  _student: user._id,
  sectionId: 0,
  originalTitle: 'Other',
  title: 'Other',
  startDate: term.start,
  endDate: term.end,
  summary: 'OTHER',
  termCode: term.code,
  crn: '00000',
  credits: 0,
  periods: [],
  links: []
});

/**
 * Given an array of course objects, find their matches and update any info and create new courses.
 *
 * @param {ObjectID} studentID The user's ID
 * @param {String} termCode The code of the term of the courses (e.g. '201901')
 * @param {Array} newCourses The course object array
 */
async function updateCourses (studentID, termCode, newCourses) {
  let colorThemeIndex = 0;
  let colorTheme = colorThemes[colorThemeIndex];
  let colorIndex = 0;
  const promises = newCourses.map(async course => {
    // Look for match in old course list
    let courseDoc = await Course.findOne({
      _student: studentID,
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
      course.color = colorTheme[colorIndex];
      colorIndex++;
      if (colorIndex === colorTheme.length) colorIndex = 0;

      courseDoc = new Course(course);
    }
    courseDoc.save();

    return courseDoc;
  });

  return Promise.all(promises);
}

async function setAllFromSIS (ctx) {
  const { rin, pin } = ctx.request.body;

  if (!rin || !pin) {
    return ctx.badRequest('You must pass `rin` and `pin`!');
  }

  const terms = await Term.find();

  let registeredTermCodes = await scrapeSISForRegisteredTerms(rin, pin);
  ctx.state.user.terms = registeredTermCodes;
  ctx.state.user.setup.terms = true;

  const profileInfo = await scrapeSISForProfileInfo(rin, pin);
  ctx.state.user.set(profileInfo);
  ctx.state.user.setup.profile = true;

  if (!ctx.state.user.grad_year) {
    // Guess graduation year
    try {
      const gradYear = parseInt(registeredTermCodes.sort()[0].substring(0, 4)) + 4;
      ctx.state.user.grad_year = gradYear;
      logger.info(`Guessed graduation year to be ${gradYear}`);
    } catch (e) {
      logger.error('Could not guess graduation year.');
    }
  }

  let currentCourses = [];

  for (let termCode of registeredTermCodes) {
    logger.info(`${termCode}: Getting courses`);

    const term = terms.find(t => t.code === termCode);

    let courseSchedule;
    try {
      courseSchedule = await scrapeSISForCourseSchedule(
        rin,
        pin,
        term,
        ctx.state.user._id
      );
    } catch (e) {
      logger.error(e);
      registeredTermCodes = registeredTermCodes.filter(code => code !== termCode);
      ctx.state.user.terms = registeredTermCodes;
      continue;
    }
    try {
      courseSchedule = await scrapePeriodTypesFromCRNs(termCode, courseSchedule);
    } catch (e) {
      logger.error(`Failed to get period types for ${termCode}`);
    }
    courseSchedule.push(generateOtherCourse(ctx.state.user, term));
    await updateCourses(ctx.state.user._id, termCode, courseSchedule);
    ctx.state.user.setup.course_schedule.push(termCode);

    logger.info(`Got ${courseSchedule.length} courses`);

    if (termCode === ctx.session.currentTerm.code) currentCourses = courseSchedule;
  }

  await ctx.state.user.save();

  ctx.ok({
    updatedUser: ctx.state.user,
    courses: currentCourses
  });
}

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

  // There are two methods:
  // manual: the body has the fields given
  // sis: the body has the RIN and PIN to scrape SIS

  if (!body.method) {
    return ctx.badRequest('You must supply a method!');
  }

  if (body.method === 'manual') {
    ctx.state.user.name.first = body.first_name;
    ctx.state.user.name.last = body.last_name;
    ctx.state.user.major = body.major;

    ctx.state.user.grad_year = parseInt(body.grad_year);
  } else if (body.method === 'sis') {
    const { rin, pin } = body;

    const scrapedInfo = await scrapeSISForProfileInfo(rin, pin);
    ctx.state.user.set(scrapedInfo);
  } else {
    return ctx.badRequest('Invalid method.');
  }

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

  try {
    await ctx.state.user.save();
  } catch (e) {
    logger.error(`Failed to save user ${ctx.state.user.rcs_id}: ${e}`);
    return ctx.internalServerError('There was an issue saving the user.');
  }

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
      body.rin,
      body.pin,
      ctx.session.currentTerm,
      ctx.state.user._id
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
  courseSchedule.push(generateOtherCourse(ctx.state.user, ctx.session.currentTerm));

  // If reimporting, only update sectionId, start/end dates, credits, and periods
  const courses = await updateCourses(ctx.state.user._id, ctx.session.currentTerm.code, courseSchedule);

  ctx.state.user.setup.course_schedule.push(ctx.session.currentTerm.code);
  await ctx.state.user.save();

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
  setAllFromSIS,
  setProfile,
  setTerms,
  importCourseSchedule,
  setTimePreference,
  setGoogle
};
