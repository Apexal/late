const request = require('request-promise');
const cheerio = require('cheerio');

const logger = require('./logger');

const SIS_LOGIN_URL = 'https://sis.rpi.edu/rss/twbkwbis.P_ValLogin';
const SIS_SCHEDULE_URL = 'https://sis.rpi.edu/rss/bwskfshd.P_CrseSchdDetl';

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
async function scrapeSISForCRNS (RIN, PIN, term) {
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
  const CRNs = $('acronym[title="Course Reference Number"]')
    .map(function (i, el) {
      return $(this)
        .parent()
        .next()
        .text();
    })
    .get();

  return CRNs;
}

module.exports = { scrapeSISForCRNS };
