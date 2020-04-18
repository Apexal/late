const logger = require('../../modules/logger')

const google = require('../../modules/google')

const Sentry = require('@sentry/node')

const {
  loginToSIS,
  scrapeSISForRegisteredTerms,
  scrapeSISForProfileInfo,
  scrapeSISForCourseSchedule,
  scrapePeriodTypesFromCRNs,
  scrapeSISForSingleCourse
} = require('../../modules/scraping')

const colorThemes = require('../../modules/color_themes')
const directory = require('../../modules/directory')

const randomColor = require('randomcolor')

const Term = require('../terms/terms.model')
const Course = require('../courses/courses.model')

const generateOtherCourse = (user, term) => ({
  _student: user._id,
  sectionId: 0,
  originalTitle: 'Other',
  title: 'Other',
  startDate: term.startDate,
  endDate: term.endDate,
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
    }).populate('_blocks')

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

/**
 * Given SIS credentials, grab a student's course schedules, name and major, etc.
 *
 * **Request Body**
 * - rin: String RIN of student
 * - pin: String SIS password of student
 *
 * **Response JSON**
 * - updatedUser: The updated logged in user document
 * - courses: Array of new/updated Course documents
 */
module.exports.setAllFromSIS = async function (ctx, next) {
  const terms = await Term.find()

  let registeredTermCodes = await scrapeSISForRegisteredTerms(ctx.state.jar)
  ctx.state.user.terms = registeredTermCodes
  ctx.state.user.setup.terms = true

  try {
    const profileInfo = await scrapeSISForProfileInfo(ctx.state.jar)
    if (!ctx.state.user.name.first) {
      ctx.state.user.name.first = profileInfo.name.first
    }
    if (!ctx.state.user.name.last) {
      ctx.state.user.name.last = profileInfo.name.last
    }
    if (!ctx.state.user.major) {
      ctx.state.user.major = profileInfo.major
    }
  } catch (e) {
    // Might fail for some random reason
    logger.error(`Could not find profile details for ${ctx.state.user.rcs_id}`)
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
        ctx.state.jar,
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
      Sentry.captureException(e)
    }
    courseSchedule.push(generateOtherCourse(ctx.state.user, term))
    await updateCourses(ctx.state.user._id, termCode, courseSchedule)
    ctx.state.user.setup.course_schedule.push(termCode)

    logger.info(`Got ${courseSchedule.length} courses`)

    // Handle GCal
    if (ctx.state.user.integrations.google.calendarID) {
      try {
        await google.actions.createRecurringEventsFromCourseSchedule(ctx.state.googleAuth, ctx.state.user.integrations.google.calendarID, termCode, courseSchedule)
        logger.info(`Updated GCal for ${ctx.state.user.identifier}`)
      } catch (e) {
        logger.error(`Couldn't update GCal for ${ctx.state.user.identifier}`)
        Sentry.captureException(e)
      }
    }
  }

  ctx.state.user.lastSISUpdate = new Date()

  ctx.state.data.courses = !ctx.session.currentTerm ? [] : await ctx.state.user.getCoursesForTerm(ctx.session.currentTerm.code)
}

/**
 * Updates the profile of the current logged in student.
 *
 * **Request Body**
 * - first_name
 * - last_name
 * - rin
 * - graduationYear
 *
 * **Response JSON**
 * - updatedUser: The updated user document
 */
module.exports.setProfile = async function (ctx) {
  const body = ctx.request.body

  if ('first_name' in body) ctx.state.user.name.first = body.first_name
  if ('last_name' in body) ctx.state.user.name.last = body.last_name
  if ('major' in body) { ctx.state.user.major = body.major ? body.major : undefined }
  if ('graduationYear' in body) { ctx.state.user.graduationYear = isNaN(parseInt(body.graduationYear)) ? undefined : parseInt(body.graduationYear) }

  ctx.state.user.setup.profile = true

  logger.info(`Saving personal info for ${ctx.state.user.identifier}`)
}

/**
 * Set the logged in user's terms that they are on campus.
 * The term codes should be in the request body as `termCodes`
 *
 * **Request Body**
 * - termCodes: Array of term codes like '202001'
 *
 * **Response JSON**
 * - updatedUser: The updated current user document
 */
module.exports.setTerms = async function (ctx) {
  const { termCodes } = ctx.request.body

  logger.info(`Setting terms for ${ctx.state.user.identifier}`)

  // Validate the termCodes
  if (
    termCodes.some(code => !ctx.session.terms.find(term => term.code === code))
  ) {
    logger.error(
      `Could not set terms for ${ctx.state.user.identifier}: Invalid term given.`
    )
    return ctx.badRequest(
      'Couldn\'t set terms. You gave an invalid term code!'
    )
  }

  ctx.state.user.setup.terms = true
  ctx.state.user.terms = termCodes.sort() // this works even though they're strings
}

/**
 * Set the user's course schedule for a school term using SIS scraping.
 *
 * **Request Query**
 * - termCode: (optional) Specific term code to grab courses from, defaults to current term
 *
 * **Request Body**
 * - rin: The user's SIS RIN
 * - pin: The user's SIS password
 *
 * **Response JSON**
 * - updatedUser: The updated current user document
 * - courses: The updated course array
 */
module.exports.importCourseSchedule = async function (ctx) {
  const body = ctx.request.body
  const termCode = ctx.session.currentTerm ? ctx.session.currentTerm.code : ctx.query.termCode

  const targetTerm = await Term.findOne({ code: termCode })
  if (!targetTerm) {
    logger.error(`Failed to find term ${termCode}`)
    return ctx.notFound(`Term with code '${termCode}' not found.`)
  }

  logger.info(`Setting schedule info for term  ${ctx.state.user.identifier}`)

  let courseSchedule = []
  try {
    courseSchedule = await scrapeSISForCourseSchedule(
      ctx.state.jar,
      targetTerm,
      ctx.state.user._id
    )
  } catch (e) {
    logger.error(
      `Failed to scrape SIS course schedule for ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.badRequest(e.message)
  }

  // Set course types for each course
  try {
    courseSchedule = await scrapePeriodTypesFromCRNs(termCode, courseSchedule)
  } catch (e) {
    logger.error(
      `Failed to scrape period types for ${ctx.state.user.identifier}: ${e}`
    )
    ctx.internalServerError(
      'There was an error getting the proper period types for your schedule. Please manually set them below.'
    )
  }

  // "Other" course
  courseSchedule.push(generateOtherCourse(ctx.state.user, targetTerm))

  // If reimporting, only update sectionId, start/end dates, credits, and periods
  await updateCourses(ctx.state.user._id, targetTerm.code, courseSchedule)

  ctx.state.user.setup.course_schedule.push(targetTerm.code)
  ctx.state.user.lastSISUpdate = new Date()

  const courses = await ctx.state.user.getCoursesForTerm(targetTerm.code)

  // Handle GCal
  if (ctx.state.user.integrations.google.calendarID) {
    try {
      await google.actions.createRecurringEventsFromCourseSchedule(ctx.state.googleAuth, ctx.state.user.integrations.google.calendarID, termCode, courses)
      logger.info(`Updated GCal for ${ctx.state.user.identifier}`)
    } catch (e) {
      logger.error(`Couldn't update GCal for ${ctx.state.user.identifier}`)
      Sentry.captureException(e)
    }
  }

  ctx.state.data.courses = courses
}

/**
 * Grab a course from SIS and add it to the current student's list.
 *
 * **Request Params**
 * - crn: The crn of the course to search for and add
 *
 * **Request Body**
 * - rin: The user's SIS RIN
 * - pin: The user's SIS password
 *
 * **Response JSON**
 * - course: The new course document
 */
module.exports.addCourseByCRN = async function (ctx) {
  const { crn } = ctx.params

  // First make sure that the student hasn't already added this course
  const existingCourse = await Course.findOne({ _student: ctx.state.user._id, crn }).populate('_blocks')
  if (existingCourse) {
    return ctx.badRequest('You already have added that course!')
  }

  let courseData
  try {
    courseData = await scrapeSISForSingleCourse(ctx.state.jar, ctx.session.currentTerm, crn)
  } catch (e) {
    logger.error(`Failed to scrape SIS for single course ${crn}: ${e}`)
    Sentry.captureException(e)
    return ctx.internalServerError('There was an error getting the course from SIS.')
  }

  const course = new Course({
    _student: ctx.state.user._id,
    color: randomColor(),
    ...courseData
  })

  await scrapePeriodTypesFromCRNs(ctx.session.currentTerm.code, [course])

  try {
    await course.save()
  } catch (e) {
    logger.error(`Failed to save new course ${crn} for ${ctx.state.user.identifier}: ${e}`)
    Sentry.captureException(e)
    return ctx.badRequest('There was an issue saving the new course.')
  }

  logger.info(`Added new course ${course.originalTitle} by CRN for ${ctx.state.user.identifier}`)

  return ctx.created({
    course
  })
}

/**
 * Set the study/work time preference of the logged in user.
 *
 * **Request Body**
 * - earliest: Earliest work time in string format 'HH:mm'
 * - latest: Latest work time in string format 'HH:mm'
 *
 * **Request JSON**
 * - updatedUser: The updated current user document
 */
module.exports.setTimePreference = async function (ctx) {
  const { earliest, latest } = ctx.request.body

  if (!earliest || !latest) return ctx.badRequest('You must give an earliest AND latest time.')

  ctx.state.user.earliestWorkTime = earliest
  ctx.state.user.latestWorkTime = latest

  if (
    !ctx.state.user.setup.unavailability.includes(ctx.session.currentTerm.code)
  ) {
    ctx.state.user.setup.unavailability.push(ctx.session.currentTerm.code)
  }

  logger.info(`Setting work/study time preference for ${ctx.state.user.identifier}`)
}
