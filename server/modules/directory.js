const request = require('request-promise')
const cheerio = require('cheerio')

const logger = require('./logger')

async function scrapeForName (RCSID) {
  logger('Scrapping for Firstname and Lastname of Student')
}

module.exports = {
  scrapeForName
}
