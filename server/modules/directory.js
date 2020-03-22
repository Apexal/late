const { JSDOM } = require('jsdom')

const logger = require('./logger')
const RPI_INFO_BASE_URL = 'https://info.rpi.edu'
const RPI_DIRECTORY_BASE_URL = RPI_INFO_BASE_URL + '/directory-search/'

// Function to get Name and Major from Directory
async function scrapeForName (RCSID) {
  const dom = await JSDOM.fromURL(RPI_DIRECTORY_BASE_URL + RCSID)

  const document = dom.window.document
  let el = null
  document.querySelectorAll('.views-field-field-email').forEach(span => {
    if (span.textContent.trim() === RCSID + '@rpi.edu') {
      el = span
    }
  })

  if (el === null) {
    throw new Error('Could not find student!')
  }

  const linkEl = el.parentNode.querySelector('a')

  return linkEl.href
}

/**
 * Search info.rpi.edu directory for a student's full name and major.
 * This will most likely work but sometimes a user cannot be found.
 *
 * @param {String} RCSID The rcs id of the user
 */
async function getNameAndMajor (RCSID) {
  const directorySearchUrl = await scrapeForName(RCSID)
  const dom = await JSDOM.fromURL(directorySearchUrl)
  const document = dom.window.document

  const name = {}

  const directoryFullName = document.getElementById('page-title').textContent.trim().split(' ') // directoryListingPage('#page-title').html().split(' ')
  name.first = directoryFullName[0]
  name.last = directoryFullName[1]

  const major = document.querySelector('.views-field-field-major div').textContent.trim()
  return { name, major }
}

module.exports = {
  scrapeForName,
  getNameAndMajor
}
