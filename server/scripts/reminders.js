require('dotenv').config()

const logger = require('../modules/logger')
const moment = require('moment')

require('../db')

const Assignment = require('../api/assignments/assignments.model')

async function sendReminder (assessment, assessmentType, reminder) {
  if (assessmentType === 'assignment') {

  } else if (assessmentType === 'exam') {

  }
  reminder.sent = true
  await reminder.save()
}

async function exams () {
  const now = Date.now()
  const max = moment(now).add(1, 'hour')
  const assignments = await Assignment.find({ 'reminders.sent': false,
    'reminders.datetime': {
      $gte: now,
      $lte: max
    } })

  console.log(assignments)
}

exams()
