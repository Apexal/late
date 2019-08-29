const logger = require('../../modules/logger')

const google = require('../../modules/google')

const {
  scrapeSISForRegisteredTerms,
  scrapeSISForProfileInfo,
  scrapeSISForCourseSchedule,
  scrapePeriodTypesFromCRNs,
  scrapeSISForSingleCourse
} = require('../../modules/scraping')

const colorThemes = require('../../modules/color_themes')

const randomColor = require('randomcolor')

const Term = require('../terms/terms.model')
const Course = require('../courses/courses.model')

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
})

/**
 * Given an array of course objects, find their matches and update any info and create new courses.
 *
 * @param {ObjectID} studentID The user's ID
 * @param {String} termCode The code of the term of the courses (e.g. '201901')
 * @param {Array} newCourses The course object array
 */
async function updateCourses (studentID, termCode, newCourses) {
  const colorThemeIndex = 0
  const colorTheme = colorThemes[colorThemeIndex]
  let colorIndex = 0
  const promises = newCourses.map(async course => {
    // Look for match in old course list
    let courseDoc = await Course.findOne({
      _student: studentID,
      termCode,
      crn: course.crn
    })

    if (courseDoc) {
      Object.assign(courseDoc, {
        sectionId: course.sectionId,
        startDate: course.startDate,
        endDate: course.endDate,
        credits: course.credits,
        periods: course.periods
      })
    } else {
      // Generate a random color for a new course
      course.color = colorTheme[colorIndex]
      colorIndex++
      if (colorIndex === colorTheme.length) colorIndex = 0

      courseDoc = new Course(course)
    }
    courseDoc.save()

    return courseDoc
  })

  return Promise.all(promises)
}

async function setAllFromSIS (ctx) {
  const { rin, pin } = ctx.request.body

  if (!rin || !pin) {
    return ctx.badRequest('You must pass `rin` and `pin`!')
  }

  const terms = await Term.find()

  let registeredTermCodes = await scrapeSISForRegisteredTerms(rin, pin)
  ctx.state.user.terms = registeredTermCodes
  ctx.state.user.setup.terms = true

  const profileInfo = await scrapeSISForProfileInfo(rin, pin)
  if (!ctx.state.user.name.first) {
    ctx.state.user.name.first = profileInfo.name.first
  }
  if (!ctx.state.user.name.last) {
    ctx.state.user.name.first = profileInfo.name.last
  }
  if (!ctx.state.user.major) {
    ctx.state.user.major = profileInfo.major
  }

  ctx.state.user.setup.profile = true

  if (!ctx.state.user.graduationYear) {
    // Guess graduation year
    try {
      const gradYear = parseInt(registeredTermCodes.sort()[0].substring(0, 4)) + 4
      ctx.state.user.graduationYear = gradYear
      logger.info(`Guessed graduation year to be ${gradYear}`)
    } catch (e) {
      logger.error('Could not guess graduation year.')
    }
  }

  for (const termCode of registeredTermCodes) {
    logger.info(`${termCode}: Getting courses`)

    const term = terms.find(t => t.code === termCode)

    let courseSchedule
    try {
      courseSchedule = await scrapeSISForCourseSchedule(
        rin,
        pin,
        term,
        ctx.state.user._id
      )
    } catch (e) {
      logger.error(e)
      registeredTermCodes = registeredTermCodes.filter(code => code !== termCode)
      ctx.state.user.terms = registeredTermCodes
      continue
    }
    try {
      courseSchedule = await scrapePeriodTypesFromCRNs(termCode, courseSchedule)
    } catch (e) {
      logger.error(`Failed to get period types for ${termCode}`)
    }
    courseSchedule.push(generateOtherCourse(ctx.state.user, term))
    await updateCourses(ctx.state.user._id, termCode, courseSchedule)
    ctx.state.user.setup.course_schedule.push(termCode)

    logger.info(`Got ${courseSchedule.length} courses`)

    // Handle GCal
    if (ctx.state.user.integrations.google.calendarID) {
      try {
        await google.actions.createRecurringEventsFromCourseSchedule(ctx.state.googleAuth, ctx.state.user.integrations.google.calendarID, termCode, courseSchedule)
        logger.info(`Updated GCal for ${ctx.state.user.rcs_id}`)
      } catch (e) {
        logger.error(`Couldn't update GCal for ${ctx.state.user.rcs_id}`)
      }
    }
  }

  ctx.state.user.lastSISUpdate = new Date()
  await ctx.state.user.save()

  const courses = !ctx.session.currentTerm ? [] : await ctx.state.user.getCoursesForTerm(ctx.session.currentTerm.code)

  ctx.ok({
    updatedUser: ctx.state.user,
    courses
  })
}

/**
 * Given personal info in the request body:
 * - first_name
 * - last_name
 * - rin
 * - graduationYear
 * Save it to the logged in user.
 *
 * @param {Koa context} ctx
 */
async function setProfile (ctx) {
  const body = ctx.request.body

  // There are two methods:
  // manual: the body has the fields given
  // sis: the body has the RIN and PIN to scrape SIS

  if (!body.method) {
    return ctx.badRequest('You must supply a method!')
  }

  if (body.method === 'manual') {
    ctx.state.user.name.first = body.first_name
    ctx.state.user.name.last = body.last_name

    if ('major' in body) { ctx.state.user.major = body.major ? body.major : undefined }

    if ('graduationYear' in body) { ctx.state.user.graduationYear = isNaN(parseInt(body.graduationYear)) ? undefined : parseInt(body.graduationYear) }
  } else if (body.method === 'sis') {
    const { rin, pin } = body

    // Grab as much info as possible from SIS
    const scrapedInfo = await scrapeSISForProfileInfo(rin, pin)
    ctx.state.user.set(scrapedInfo)
  } else {
    return ctx.badRequest('Invalid method.')
  }

  ctx.state.user.setup.profile = true

  try {
    await ctx.state.user.save()

    logger.info(`Saved personal info for ${ctx.state.user.rcs_id}`)
    return ctx.ok({
      updatedUser: ctx.state.user
    })
  } catch (err) {
    logger.error(
      `Failed to save personal info for ${ctx.state.user.rcs_id}: ${err}`
    )
    return ctx.badRequest('There was an error saving your personal info.')
  }
}

/**
 * Set the logged in user's terms that they are on campus.
 * The term codes should be in the request body as `termCodes`
 *
 * @param {Koa context} ctx
 * @retturns updatedUser
 */
async function setTerms (ctx) {
  const { termCodes } = ctx.request.body

  logger.info(`Setting terms for ${ctx.state.user.rcs_id}`)

  // Validate the termCodes
  if (
    termCodes.some(code => !ctx.session.terms.find(term => term.code === code))
  ) {
    logger.error(
      `Could not set terms for ${ctx.state.user.rcs_id}: Invalid term given.`
    )
    return ctx.badRequest(
      'Couldn\'t set terms. You gave an invalid term code!'
    )
  }

  ctx.state.user.setup.terms = true
  ctx.state.user.terms = termCodes.sort() // this works even though they're strings

  try {
    await ctx.state.user.save()
  } catch (e) {
    logger.error(`Failed to save user ${ctx.state.user.rcs_id}: ${e}`)
    return ctx.internalServerError('There was an error saving the terms.')
  }

  ctx.ok({
    updatedUser: ctx.state.user
  })
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
  const body = ctx.request.body
  const termCode = ctx.session.currentTerm.code

  logger.info(`Setting schedule info for ${ctx.state.user.rcs_id}`)

  let courseSchedule = []
  try {
    courseSchedule = await scrapeSISForCourseSchedule(
      body.rin,
      body.pin,
      ctx.session.currentTerm,
      ctx.state.user._id
    )
  } catch (e) {
    logger.error(
      `Failed to scrape SIS course schedule for ${ctx.state.user.rcs_id}: ${e}`
    )
    return ctx.badRequest(e.message)
  }

  // Set course types for each course
  try {
    courseSchedule = await scrapePeriodTypesFromCRNs(termCode, courseSchedule)
  } catch (e) {
    logger.error(
      `Failed to scrape period types for ${ctx.state.user.rcs_id}: ${e}`
    )
    ctx.internalServerError(
      'There was an error getting the proper period types for your schedule. Please manually set them below.'
    )
  }

  // "Other" course
  courseSchedule.push(generateOtherCourse(ctx.state.user, ctx.session.currentTerm))

  // If reimporting, only update sectionId, start/end dates, credits, and periods
  const courses = await updateCourses(ctx.state.user._id, ctx.session.currentTerm.code, courseSchedule)

  ctx.state.user.setup.course_schedule.push(ctx.session.currentTerm.code)
  ctx.state.user.lastSISUpdate = new Date()

  // Handle GCal
  if (ctx.state.user.integrations.google.calendarID) {
    try {
      await google.actions.createRecurringEventsFromCourseSchedule(ctx.state.googleAuth, ctx.state.user.integrations.google.calendarID, termCode, courses)
      logger.info(`Updated GCal for ${ctx.state.user.rcs_id}`)
    } catch (e) {
      logger.error(`Couldn't update GCal for ${ctx.state.user.rcs_id}`)
    }
  }

  await ctx.state.user.save()

  ctx.ok({ updatedUser: ctx.state.user, courses })
}

/**
 * Given the CRN of a course in the URL params and the user's RIN and PIN in the request body,
 * grab a course from SIS and add it to the student's list.
 *
 * @param {Koa context} ctx
 * @returns {Object} The new course
 */
async function addCourseByCRN (ctx) {
  const { crn } = ctx.params
  const { rin, pin } = ctx.request.body

  // First make sure that the student hasn't already added this course
  const existingCourse = await Course.findOne({ _student: ctx.state.user._id, crn })
  if (existingCourse) {
    return ctx.badRequest('You already have added that course!')
  }

  let courseData
  try {
    courseData = await scrapeSISForSingleCourse(rin, pin, ctx.session.currentTerm, crn)
  } catch (e) {
    logger.error(`Failed to scrape SIS for single course ${crn}: ${e}`)
    return ctx.internalServerError('There was an error getting the course from SIS.')
  }

  const course = new Course({
    _student: ctx.state.user._id,
    color: randomColor(),
    ...courseData
  })

  try {
    await course.save()
  } catch (e) {
    logger.error(`Failed to save new course ${crn} for ${ctx.state.user.rcs_id}: ${e}`)
    return ctx.badRequest('There was an issue saving the new course.')
  }

  logger.info(`Added new course ${course.originalTitle} by CRN for ${ctx.state.user.rcs_id}`)

  return ctx.created({
    course
  })
}

/**
 * Set the study/work time preference of the logged in user.
 *
 * Body:
 * - earliest 'HH:mm'
 * - latest 'HH:mm'
 * @param {Koa context} ctx
 */
async function setTimePreference (ctx) {
  const { earliest, latest } = ctx.request.body

  if (!earliest || !latest) return ctx.badRequest('You must give an earliest AND latest time.')

  ctx.state.user.earliestWorkTime = earliest
  ctx.state.user.latestWorkTime = latest

  if (
    !ctx.state.user.setup.unavailability.includes(ctx.session.currentTerm.code)
  ) {
    ctx.state.user.setup.unavailability.push(ctx.session.currentTerm.code)
  }

  try {
    await ctx.state.user.save()
  } catch (e) {
    logger.error(
      `Failed to set work/study time preference schedule for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.badRequest('Failed to set work/study time preference schedule.')
  }

  logger.info(`Set work/study time preference for ${ctx.state.user.rcs_id}`)
  ctx.ok({ updatedUser: ctx.state.user })
}

module.exports = {
  setAllFromSIS,
  setProfile,
  setTerms,
  importCourseSchedule,
  addCourseByCRN,
  setTimePreference
}
