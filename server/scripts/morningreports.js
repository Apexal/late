require('dotenv').config()

const logger = require('../modules/logger')

require('../db')

const email = require('../integrations/email')
const Student = require('../api/students/students.model')

async function sendEmailMorningReports () {
  // Find all Students who want morning emails
  const students = await Student.find({
    rcs_id: 'matraf', // for testing
    'integrations.email.preferences.enabled': true,
    'integrations.email.preferences.dailyReports': true
  })
  logger.info(`Sending daily emails to ${students.length} users.`)
  const reports = students.map(s => email.sendMorningReportEmail(s))

  await Promise.all(reports)
}

module.exports = sendEmailMorningReports
