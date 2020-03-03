const request = require('request-promise')
const cheerio = require('cheerio')

const logger = require('./logger')
const RPI_INFO_BASE_URL = 'https://info.rpi.edu/'
const RPI_DIRECTORY_BASE_URL = RPI_INFO_BASE_URL + '/directory-search/'

// Helper function to get a page and return the parsed HTML body with Cheerio
async function getPage (URL) {
  const page = await request({
    uri: URL,
    transform: body => cheerio.load(body)
  })
  return page
}

// Function to get Name and Major from Directory
async function scrapeForName (RCSID) {
  const page = await getPage(RPI_DIRECTORY_BASE_URL + RCSID)
  return RPI_INFO_BASE_URL + page('.views-field-title a').attr().href
}

/**
 * Search info.rpi.edu directory for a student's full name and major.
 * This will most likely work but sometimes a user cannot be found.
 *
 * @param {String} RCSID The rcs id of the user
 */
async function getNameAndMajor (RCSID) {
  const directorySearchUrl = await scrapeForName(RCSID)

  const name = {}

  const directoryListingPage = await getPage(directorySearchUrl)
  const directoryFullName = directoryListingPage('#page-title').html().split(' ')
  name.first = directoryFullName[0]
  name.last = directoryFullName[1]

  const major = directoryListingPage('.views-field-field-major div').html()
  return { name, major }
}

module.exports = {
  scrapeForName,
  getNameAndMajor
}
