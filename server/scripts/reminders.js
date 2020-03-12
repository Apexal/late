require('dotenv').config()

const logger = require('../modules/logger')
const moment = require('moment')

require('../db')

const Course = require('../api/courses/courses.model')
const Assignment = require('../api/assignments/assignments.model')
const Exam = require('../api/exams/exams.model')

const { sendText } = require('../integrations/sms')
const { sendGenericEmail } = require('../integrations/email')

async function sendReminder (assessment, reminder) {
  const course = await Course.findOne({ crn: assessment.courseCRN, _student: assessment._student })
  const dateTimeString = moment(assessment.date).format('dddd, MMMM Do h:mma')
  const fromNow = moment(assessment.date).fromNow()
  const url = 'https://late.work/coursework/' + assessment.assessmentType.charAt(0) + '/' + assessment._id

  const { assessmentType } = assessment

  if (reminder.integration === 'sms') {
    let message
    if (assessmentType === 'assignment') {
      message = `"${assessment.title}", your ${course.title} assignment is due ${fromNow}!`
    } else if (assessmentType === 'exam') {
      message = `"${assessment.title}" (${course.title} exam) is ${fromNow}!`
    }

    message += `\n\n${url}`

    try {
      logger.info('Sending reminder')
      await sendText(assessment._student.integrations.sms.phoneNumber, message)
      reminder.sent = true
    } catch (e) {
      logger.error(e.stack)
    }
  } else if (reminder.integration === 'email') {
    try {
      logger.info('Sending email reminder...')
      await sendGenericEmail(assessment._student.rcs_id, 'Reminder', {
        preheader: `An ${assessmentType} is coming up!`,
        title: 'Title Woo!',
        content: `
        <p>
          Don't forget about your <b>${assessmentType}</b> <i>${assessment.title}</i> coming up soon!
        </p>
        `,
        buttons: [
          {
            text: 'View on LATE',
            url
          }
        ]
      })
      reminder.sent = true
    } catch (e) {
      logger.error(e.stack)
    }
  }
}

/**
 * Find all assessments that have reminders that have yet to be sent out and are in the past.
 * Pass each of these reminders and their associated assessment and student to be sent out.
 *
 * This will be automatically run by Heroku every hour.
 */
async function findAndSendAssessments () {
  logger.info('Finding assessments with reminders to be sent...')
  const now = Date.now()

  const query = {
    'reminders.sent': false,
    'reminders.datetime': {
      $lte: now
    }
  }

  const [assignments, exams] = await Promise.all([Assignment.find(query).populate('_student', 'rcs_id name integrations'), Exam.find(query).populate('_student', 'rcs_id name integrations')])

  await Promise.all(assignments.concat(exams).map(async assessment => {
    const reminders = assessment.reminders.filter(r => r.sent === false && r.datetime <= now)

    await Promise.all(reminders.map(async reminder => sendReminder(assessment, reminder)))
    return assessment.save()
  }))

  logger.info('Finished sending reminders... Exiting.')
  process.exit()
}

findAndSendAssessments()
