const request = require('request-promise');
const cheerio = require('cheerio');
const moment = require('moment');

const logger = require('./logger');

const SIS_LOGIN_URL = 'https://sis.rpi.edu/rss/twbkwbis.P_ValLogin';
const SIS_SCHEDULE_URL = 'https://sis.rpi.edu/rss/bwskfshd.P_CrseSchdDetl';

const DAY_INITIALS = {
  'M': 1,
  'T': 2,
  'W': 3,
  'R': 4,
  'F': 5
};

/**
 * Checks if the login was successful by checking the HTML of the page for login error messages.
 */
function checkLogin ($) {
  // TODO: implement
  return true;
}

/**
 * Given a student's id (their RIN) and their PIN,
 * login to SIS for them and navigate to their shedule page
 * and simply grab the CRNs of each of their courses and forget their credentials.
 **/
async function scrapeSISForCourseSchedule (RIN, PIN, term) {
  // The cookie jar to persist the login session
  // Must be used with each request
  const jar = request.jar();

  logger.info(`Getting CRNs student ${RIN} from SIS.`);

  // Attempt to login to SIS
  let $ = await request({
    jar,
    uri: SIS_LOGIN_URL,
    method: 'POST',
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

  // Submit schedule form choosing the right term
  $ = await request({
    uri: SIS_SCHEDULE_URL,
    method: 'POST',
    form: {
      term_in: term
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
  const courseSchedule = [];
  const courseOverviews = $('table[summary="This layout table is used to present the schedule course detail"]');

  courseOverviews.each(function (i, el) {
    const courseTitleLine = $(this).find('caption[class="captiontext"]').first().text();

    const courseParts = courseTitleLine.split(' - ');
    const courseLongName = courseParts[0];
    const summary = courseParts[1];
    const sectionId = courseParts[2];

    const crn = $(this).find('acronym[title="Course Reference Number"]').parent()
      .next()
      .text();

    const course = {
      section_id: sectionId,
      listing_id: '00',
      original_longname: courseLongName,
      summary: summary,
      longname: courseLongName,
      crn,
      periods: []
    };

    $(this).next('table[summary="This table lists the scheduled meeting times and assigned instructors for this class.."]')
      .find('tr:not(:first-child)')
      .each(function (i, el) {
        const time = $(this).find('td:nth-child(2)').text().split(' - ');
        const start = moment(time[0], 'h:mm a', true).format('Hmm');
        const end = moment(time[1], 'h:mm a', true).format('Hmm');
        const location = $(this).find('td:nth-child(4)').text();

        const days = $(this).find('td:nth-child(3)').text().split('').map(d => DAY_INITIALS[d]);

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

    courseSchedule.push(course);
  });

  return courseSchedule;
}

module.exports = { scrapeSISForCourseSchedule };
