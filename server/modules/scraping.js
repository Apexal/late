const request = require('request-promise')
const cheerio = require('cheerio')
const moment = require('moment')

const logger = require('./logger')

const SIS_LOGIN_URL = 'https://sis.rpi.edu/rss/twbkwbis.P_ValLogin'
const SIS_SCHEDULE_URL = 'https://sis.rpi.edu/rss/bwskfshd.P_CrseSchdDetl'
const SIS_TRANSCRIPT_URL = 'https://sis.rpi.edu/rss/bwskotrn.P_ViewTran'
const SIS_COURSE_FROM_CRN_URL = 'https://sis.rpi.edu/rss/bwckschd.p_disp_listcrse?subj_in=&crse_in='
const SIS_VIEW_TERM_REGISTRATION_URL = 'https://sis.rpi.edu/rss/bwskrsta.P_RegsStatusDisp'
const PERIOD_LIST_URL_BASE = 'https://sis.rpi.edu/reg/zs' // + term + '.htm'

const COURSE_LIST_TITLE_REGEXP = /^(?<title>.*) - (?<summary>.+) - (?<sectionId>\d{2})$/
const COURSE_SINGLE_TITLE_REGEXP = /^(?<title>.*) - (?<crn>\d{5}) - (?<summary>.+) - (?<sectionId>\d{2})$/

const PERIOD_TABLE_TYPE_COLUMN = 3
const PERIOD_TABLE_DAYS_COLUMN = 6
const PERIOD_TABLE_START_TIME_COLUMN = 7
const PERIOD_TABLE_END_TIME_COLUMN = 8

const DAY_INITIALS = {
  M: 1,
  T: 2,
  W: 3,
  R: 4,
  F: 5
}

const possibleTerms = () => {
  const possibleTerms = []
  const nextYear = moment().year() + 1
  for (let year = nextYear; year > nextYear - 5; year--) {
    possibleTerms.push(year + '09')
    possibleTerms.push(year + '05')
    possibleTerms.push(year + '01')
  }
  return possibleTerms
}

/**
 * Checks if the login was successful by checking the HTML of the page for login error messages.
 */
function checkLogin ($) {
  return $('title').text() !== 'User Login'
}

/**
 * Given SIS credentials, attempt to login and return the cookie jar
 * for further requests.
 *
 * @param {String} RIN String RIN of student
 * @param {String} PIN String SIS password of student
 * @returns jar Request jar
 */
async function loginToSIS (RIN, PIN) {
  const jar = request.jar()

  // Attempt to login to SIS
  const $ = await request({
    jar,
    uri: SIS_LOGIN_URL,
    method: 'POST',
    rejectUnauthorized: false,
    form: {
      sid: RIN,
      PIN
    },
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36',
      Referrer: 'https://sis.rpi.edu/rss/twbkwbis.P_WWWLogin',
      Origin: 'https://sis.rpi.edu',
      Host: 'sis.rpi.edu',
      Cookie: 'TESTID=set'
    },
    transform: body => cheerio.load(body)
  })

  // TODO: validate login
  if (!checkLogin($)) throw new Error('Failed to login to SIS. Please check your credentials!')

  return jar
}

/**
 * Determine what terms a student is registered for from SIS.
 *
 * @param {*} jar
 */
async function scrapeSISForRegisteredTerms (jar) {
  logger.info('Getting registered terms for student from SIS.')

  const termCodes = possibleTerms()

  const registeredCodes = []
  for (const termCode of termCodes) {
    const $ = await request({
      uri: SIS_VIEW_TERM_REGISTRATION_URL,
      method: 'POST',
      form: {
        term_in: termCode
      },
      transform: body => cheerio.load(body),
      jar
    })

    if ($('div.pagetitlediv h2').text().trim() === 'Check Your Registration Status:') {
      registeredCodes.push(termCode)
    }
  }
  return registeredCodes
}

/**
 * Given a student's id (their RIN) and their PIN,
 * login to SIS for them and navigate to their unofficial transcript
 * to get their name and major.
 *
 * @param {*} jar Request jar after logging in
 * @returns Object with name object and major string
 **/
async function scrapeSISForProfileInfo (jar) {
  logger.info('Getting profile info for student from SIS.')

  const $ = await request({
    uri: SIS_TRANSCRIPT_URL,
    rejectUnauthorized: false,
    method: 'POST',
    form: {
      levl: '',
      tprt: 'UWEB'
    },
    transform: body => cheerio.load(body),
    jar
  })

  // 'Frank J. Matranga' -> ['Frank', 'J.', 'Matranga']
  const nameParts = $('table.datadisplaytable tbody tr th:contains("Name :")').next().text().split(' ')

  const name = {}

  if (nameParts[0]) {
    name.first = nameParts[0]
  }
  if (nameParts[nameParts.length - 1]) {
    name.last = nameParts[nameParts.length - 1]
  }

  const major = $('table.datadisplaytable tbody tr th:contains("Major:")').first().next().text()

  return {
    name,
    major
  }
}

/**
 * Given a student's id (their RIN) and their PIN,
 * login to SIS for them and navigate to their shedule page
 * and simply grab the CRNs of each of their courses and forget their credentials.
 *
 * @param {*} jar Request jar after logging in
 * @param {Object} term Term document
 * @param {ObjectID} studentID ID of Student document to create Course documents
 * @returns Array of unsaved Course documents
 */
async function scrapeSISForCourseSchedule (jar, term, studentID) {
  logger.info(`Getting courses for student ${studentID} from SIS.`)

  // Submit schedule form choosing the right term
  const $ = await request({
    uri: SIS_SCHEDULE_URL,
    rejectUnauthorized: false,
    method: 'POST',
    form: {
      term_in: term.code
    },
    transform: body => cheerio.load(body),
    jar
  })

  // the layout of the table is as follows (in Pug here)
  /*
    tr
      th.ddlabel(colspan='2', scope='row')
        | CRN
        acronym(title='Course Reference Number')
      td.dddefault CRN_HERE
  */
  if (
    $('table[summary="This layout table holds message information"]').length
  ) {
    throw new Error('You are not enrolled in this term!')
  }
  const courseSchedule = []
  const courseOverviews = $(
    'table[summary="This layout table is used to present the schedule course detail"]'
  )

  courseOverviews.each(function (i, el) {
    const courseTitleLine = $(this)
      .find('caption[class="captiontext"]')
      .first()
      .text()

    const titleGroups = courseTitleLine.match(COURSE_LIST_TITLE_REGEXP).groups

    const courseTitle = titleGroups.title
    const summary = titleGroups.summary
    const sectionId = parseInt(titleGroups.sectionId)

    const crn = $(this)
      .find('acronym[title="Course Reference Number"]')
      .parent()
      .next()
      .text()

    const credits = parseFloat(
      $(this)
        .find('tbody tr:nth-child(6) td')
        .text()
    )

    const course = {
      _student: studentID,
      sectionId,
      originalTitle: courseTitle,
      title: courseTitle,
      termCode: term.code,
      summary,
      crn,
      startDate: term.startDate,
      endDate: term.classesEndDate,
      credits,
      links: [],
      periods: []
    }

    $(this)
      .next(
        'table[summary="This table lists the scheduled meeting times and assigned instructors for this class.."]'
      )
      .find('tr:not(:first-child)')
      .each(function (i, el) {
        const time = $(this)
          .find('td:nth-child(2)')
          .text()
          .split(' - ')
        const startTime = moment(time[0], 'h:mm a', true).format('HH:mm')
        const endTime = moment(time[1], 'h:mm a', true).format('HH:mm')

        if (startTime === 'Invalid date') return

        const days = $(this)
          .find('td:nth-child(3)')
          .text()
          .split('')
          .map(d => DAY_INITIALS[d])

        const location = $(this)
          .find('td:nth-child(4)')
          .text()

        const dateRangeParts = $(this)
          .find('td:nth-child(5)')
          .text()
          .split(' - ')

        course.startDate = moment(dateRangeParts[0], 'MMM DD[,] YYYY')
        course.endDate = moment(dateRangeParts[1], 'MMM DD[,] YYYY')

        for (const day of days) {
          const period = {
            day,
            startTime,
            endTime,
            type: 'LEC',
            location
          }
          course.periods.push(period)
        }
      })

    // Sort periods
    course.periods = course.periods.sort((a, b) => {
      if (a.day > b.day) return 1
      else if (a.day < b.day) return -1
      else if (a.startTime > b.startTime) return 1
      else if (a.startTime < b.startTime) return -1

      return 0
    })

    courseSchedule.push(course)
  })

  return courseSchedule
}

/**
 * Grab all the info for a particular course given the term and crn. It does not grab the proper period types though.
 *
 * @param {String} jar Request jar from logging in to SIS
 * @param {Object} term The term object for the course
 * @param {String} crn The CRN of the course
 * @returns {Object} The compiled course object with every required property set except _student and color.
 */
async function scrapeSISForSingleCourse (jar, term, crn) {
  logger.info(`Getting course ${crn} for a student from SIS.`)

  // Submit schedule form choosing the right term
  const $ = await request({
    uri: SIS_COURSE_FROM_CRN_URL + `&term_in=${term.code}&crn_in=${crn}`,
    rejectUnauthorized: false,
    method: 'GET',
    transform: body => cheerio.load(body),
    jar
  })

  const courseTable = $('table[summary="This layout table is used to present the sections found"]')
  if (courseTable.length === 0) throw new Error('No course found!')

  const titleA = $('a', courseTable).first()
  console.log(titleA.text())
  const titleGroups = titleA.text().match(COURSE_SINGLE_TITLE_REGEXP).groups

  const title = titleGroups.title
  const summary = titleGroups.summary
  const sectionId = parseInt(titleGroups.sectionId)

  const text = $('a:contains(View Catalog Entry)').parent().contents().filter(function () { return this.type === 'text' }).text().split(' ')
  const credits = parseFloat(text[text.length - 2])

  let periods = []

  let startDate = moment(term.startDate)
  let endDate = moment(term.endDate)

  $('table[summary="This table lists the scheduled meeting times and assigned instructors for this class.."]')
    .find('tr:not(:first-child)')
    .each(function (i, el) {
      const time = $(this)
        .find('td:nth-child(2)')
        .text()
        .split(' - ')
      const startTime = moment(time[0], 'h:mm a', true).format('HH:mm')
      const endTime = moment(time[1], 'h:mm a', true).format('HH:mm')

      if (startTime === 'Invalid date') return

      const days = $(this)
        .find('td:nth-child(3)')
        .text()
        .split('')
        .map(d => DAY_INITIALS[d])

      const location = $(this)
        .find('td:nth-child(4)')
        .text()

      const dateRangeParts = $(this)
        .find('td:nth-child(5)')
        .text()
        .split(' - ')

      startDate = moment(dateRangeParts[0], 'MMM DD[,] YYYY')
      endDate = moment(dateRangeParts[1], 'MMM DD[,] YYYY')

      for (const day of days) {
        const period = {
          day,
          startTime,
          endTime,
          type: 'LEC',
          location
        }
        periods.push(period)
      }
    })

  // Sort periods
  periods = periods.sort((a, b) => {
    if (a.day > b.day) return 1
    else if (a.day < b.day) return -1
    else if (a.startTime > b.startTime) return 1
    else if (a.startTime < b.startTime) return -1

    return 0
  })

  return {
    crn,
    startDate: startDate.toDate(),
    endDate: endDate.toDate(),
    originalTitle: title,
    title,
    termCode: term.code,
    credits,
    sectionId,
    summary,
    links: [],
    periods
  }
}

/**
 * Given a term code and a list of CRNs to search for,
 * request the period list site and find the period type
 * for each CRN in the table.
 *
 * @param {String} termCode The code of the current term.
 * @param {Array} courses The array of courses to modify
 * @returns {Object} mapping of crn to 3-character period type (LEC, LAB, TES, etc)
 */
async function scrapePeriodTypesFromCRNs (termCode, courses) {
  const uri = PERIOD_LIST_URL_BASE + termCode + '.htm'
  const $ = await request({
    rejectUnauthorized: false,
    uri,
    transform: body => cheerio.load(body)
  })

  for (const course of courses) {
    // Scrape for period type
    const paddedSection =
      `${course.sectionId}`.length === 2 ? course.sectionId : '0' + course.sectionId

    // Generate title as found on the table site
    const title =
      course.crn + ' ' + course.summary.replace(' ', '-') + '-' + paddedSection
    // e.g. '85389 CSCI-4965-01'

    const topRow = $(`table tr td:first-child:contains('${title}')`).parent(
      'tr'
    )
    if (topRow.length === 0) {
      logger.info('Cannot find period info for ' + title + '. Skipping.')
      continue
    }
    logger.info(`Found period types for '${title}'`)
    // There is one row for each unique period, see https://snag.gy/uHR9OK.jpg for example
    // One row could be for multiple days if they have the same start and end time
    let currentRow = topRow
    do {
      const startTimeText = $(
        `td:nth-child(${PERIOD_TABLE_START_TIME_COLUMN}) span`,
        currentRow
      ).text()

      const endTime = moment(
        $(
          `td:nth-child(${PERIOD_TABLE_END_TIME_COLUMN}) span`,
          currentRow
        ).text(),
        'h:mmA'
      )
      let meridiem = 'AM'
      if (endTime.hours() >= 12) {
        // endTime is PM, determine start time
        meridiem = 'PM'
        if (
          parseInt(startTimeText.split(':')[0]) > endTime.hours() &&
          parseInt(startTimeText.split(':')[0]) >= 6
        ) {
          meridiem = 'AM'
        }
      }
      const startTime = moment(
        $(
          `td:nth-child(${PERIOD_TABLE_START_TIME_COLUMN}) span`,
          currentRow
        ).text() + meridiem,
        'h:mmA'
      )

      const days = $(
        `td:nth-child(${PERIOD_TABLE_DAYS_COLUMN}) span`,
        currentRow
      )
        .text()
        .split('')
        .map(str => DAY_INITIALS[str])

      const matchedPeriod = course.periods.find(
        p =>
          days.includes(p.day) &&
          p.startTime === startTime.format('HH:mm') &&
          p.endTime === endTime.format('HH:mm')
      )

      if (matchedPeriod) {
        matchedPeriod.type = $(
          `td:nth-child(${PERIOD_TABLE_TYPE_COLUMN}) span`,
          currentRow
        ).text()
      }

      currentRow = currentRow.next('tr')
    } while (
      $('td:nth-child(1)', currentRow)
        .text()
        .trim().length === 0
    )
  }
  return courses
}

module.exports = {
  loginToSIS,
  scrapeSISForRegisteredTerms,
  scrapeSISForProfileInfo,
  scrapeSISForCourseSchedule,
  scrapeSISForSingleCourse,
  scrapePeriodTypesFromCRNs
}
