const request = require('request-promise');
const cheerio = require('cheerio');
const moment = require('moment');

const logger = require('./logger');

const SIS_LOGIN_URL = 'https://sis.rpi.edu/rss/twbkwbis.P_ValLogin';
const SIS_SCHEDULE_URL = 'https://sis.rpi.edu/rss/bwskfshd.P_CrseSchdDetl';
const SIS_TRANSCRIPT_URL = 'https://sis.rpi.edu/rss/bwskotrn.P_ViewTran';
const PERIOD_LIST_URL_BASE = 'https://sis.rpi.edu/reg/zs'; // + term + '.htm'

const PERIOD_TABLE_TYPE_COLUMN = 3;
const PERIOD_TABLE_DAYS_COLUMN = 6;
const PERIOD_TABLE_START_TIME_COLUMN = 7;
const PERIOD_TABLE_END_TIME_COLUMN = 8;

const DAY_INITIALS = {
  M: 1,
  T: 2,
  W: 3,
  R: 4,
  F: 5
};

/**
 * Checks if the login was successful by checking the HTML of the page for login error messages.
 */
function checkLogin ($) {
  return $('title').text() !== 'User Login';
}

async function loginToSIS (RIN, PIN) {
  const jar = request.jar();

  // Attempt to login to SIS
  let $ = await request({
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
  });

  // TODO: validate login
  if (!checkLogin($)) throw new Error(`Failed to login to SIS as ${RIN}.`);

  return jar;
}

/**
 * Given a student's id (their RIN) and their PIN,
 * login to SIS for them and navigate to their unofficial transcript
 * ...
 **/
async function scrapeSISForProfileInfo (RIN, PIN) {
  // The cookie jar to persist the login session
  // Must be used with each request
  const jar = await loginToSIS(RIN, PIN);

  logger.info(`Getting profile info for student ${RIN} from SIS.`);

  let $ = await request({
    uri: SIS_TRANSCRIPT_URL,
    rejectUnauthorized: false,
    method: 'POST',
    form: {
      levl: '',
      tprt: 'UWEB'
    },
    transform: body => cheerio.load(body),
    jar
  });

  // 'Frank J. Matranga' -> ['Frank', 'J.', 'Matranga']
  const nameParts = $('table.datadisplaytable tbody tr th:contains("Name :")').next().text().split(' ');

  const name = {
    first: nameParts.slice(0, nameParts.length - 1).join(' '),
    last: nameParts.slice(-1).join(' ')
  };

  const major = $('table.datadisplaytable tbody tr th:contains("Major:")').first().next().text();

  return {
    name,
    major
  };
}

/**
 * Given a student's id (their RIN) and their PIN,
 * login to SIS for them and navigate to their shedule page
 * and simply grab the CRNs of each of their courses and forget their credentials.
 **/
async function scrapeSISForCourseSchedule (RIN, PIN, term, user) {
  // The cookie jar to persist the login session
  // Must be used with each request
  const jar = await loginToSIS(RIN, PIN);

  logger.info(`Getting courses for student ${RIN} from SIS.`);

  // Submit schedule form choosing the right term
  let $ = await request({
    uri: SIS_SCHEDULE_URL,
    rejectUnauthorized: false,
    method: 'POST',
    form: {
      term_in: term.code
    },
    transform: body => cheerio.load(body),
    jar
  });

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
    throw new Error('You are not enrolled in this term!');
  }
  const courseSchedule = [];
  const courseOverviews = $(
    'table[summary="This layout table is used to present the schedule course detail"]'
  );

  courseOverviews.each(function (i, el) {
    const courseTitleLine = $(this)
      .find('caption[class="captiontext"]')
      .first()
      .text();
    const courseParts = courseTitleLine.split(' - ');
    const courseTitle = courseParts[0];
    const summary = courseParts[1];
    const sectionId = parseInt(courseParts[2]);

    const crn = $(this)
      .find('acronym[title="Course Reference Number"]')
      .parent()
      .next()
      .text();

    const credits = parseFloat(
      $(this)
        .find('tbody tr:nth-child(6) td')
        .text()
    );

    const course = {
      _student: user._id,
      sectionId,
      originalTitle: courseTitle,
      title: courseTitle,
      termCode: term.code,
      summary,
      crn,
      startDate: term.start,
      endDate: term.classesEnd,
      credits,
      links: [],
      periods: []
    };

    $(this)
      .next(
        'table[summary="This table lists the scheduled meeting times and assigned instructors for this class.."]'
      )
      .find('tr:not(:first-child)')
      .each(function (i, el) {
        const time = $(this)
          .find('td:nth-child(2)')
          .text()
          .split(' - ');
        const start = moment(time[0], 'h:mm a', true).format('Hmm');
        const end = moment(time[1], 'h:mm a', true).format('Hmm');

        if (start === 'Invalid date') return;

        const days = $(this)
          .find('td:nth-child(3)')
          .text()
          .split('')
          .map(d => DAY_INITIALS[d]);

        const location = $(this)
          .find('td:nth-child(4)')
          .text();

        const dateRangeParts = $(this)
          .find('td:nth-child(5)')
          .text()
          .split(' - ');

        course.startDate = moment(dateRangeParts[0], 'MMM DD[,] YYYY');
        course.endDate = moment(dateRangeParts[1], 'MMM DD[,] YYYY');

        for (let day of days) {
          const period = {
            day,
            start,
            end,
            type: 'LEC',
            location
          };
          course.periods.push(period);
        }
      });

    // Sort periods
    course.periods = course.periods.sort((a, b) => {
      if (a.day > b.day) return 1;
      else if (a.day < b.day) return -1;
      else if (parseInt(a.start) > parseInt(b.start)) return 1;
      else if (parseInt(a.start) < parseInt(b.start)) return -1;

      return 0;
    });

    courseSchedule.push(course);
  });

  return courseSchedule;
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
  const uri = PERIOD_LIST_URL_BASE + termCode + '.htm';
  const $ = await request({
    rejectUnauthorized: false,
    uri,
    transform: body => cheerio.load(body)
  });

  for (let course of courses) {
    // Scrape for period type
    const paddedSection =
      course.sectionId > 9 ? course.sectionId : '0' + course.sectionId;

    // Generate title as found on the table site
    const title =
      course.crn + ' ' + course.summary.replace(' ', '-') + '-' + paddedSection;
    logger.info(`Finding period types for '${title}'`);
    const topRow = $(`table tr td:first-child:contains('${title}')`).parent(
      'tr'
    );
    if (topRow.length === 0) {
      logger.info('Cannot find period info for ' + title + '. Skipping.');
      continue;
    }
    // There is one row for each unique period, see https://snag.gy/uHR9OK.jpg for example
    // One row could be for multiple days if they have the same start and end time
    let currentRow = topRow;
    do {
      let startTimeText = $(
        `td:nth-child(${PERIOD_TABLE_START_TIME_COLUMN}) span`,
        currentRow
      ).text();

      const endTime = moment(
        $(
          `td:nth-child(${PERIOD_TABLE_END_TIME_COLUMN}) span`,
          currentRow
        ).text(),
        'h:mmA'
      );
      let meridiem = 'AM';
      if (endTime.hours() >= 12) {
        // endTime is PM, determine start time
        meridiem = 'PM';
        if (
          parseInt(startTimeText.split(':')[0]) > endTime.hours() &&
          parseInt(startTimeText.split(':')[0]) >= 6
        ) {
          meridiem = 'AM';
        }
      }
      const startTime = moment(
        $(
          `td:nth-child(${PERIOD_TABLE_START_TIME_COLUMN}) span`,
          currentRow
        ).text() + meridiem,
        'h:mmA'
      );

      const days = $(
        `td:nth-child(${PERIOD_TABLE_DAYS_COLUMN}) span`,
        currentRow
      )
        .text()
        .split('')
        .map(str => DAY_INITIALS[str]);

      const matchedPeriod = course.periods.find(
        p =>
          days.includes(p.day) &&
          p.start === startTime.format('Hmm') &&
          p.end === endTime.format('Hmm')
      );

      if (matchedPeriod) {
        matchedPeriod.type = $(
          `td:nth-child(${PERIOD_TABLE_TYPE_COLUMN}) span`,
          currentRow
        ).text();
      }

      currentRow = currentRow.next('tr');
    } while (
      $('td:nth-child(1)', currentRow)
        .text()
        .trim().length === 0
    );
  }
  return courses;
}

module.exports = {
  scrapeSISForProfileInfo,
  scrapeSISForCourseSchedule,
  scrapePeriodTypesFromCRNs
};
