const accountSid = process.env.TWILIO_ACCOUNT_SID // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN // Your Auth Token from www.twilio.com/console
const phoneNumber = process.env.TWILIO_PHONE_NUMBER
const moment = require('moment')

const client = require('twilio')(accountSid, authToken)

const sanitizePhoneNumber = number => '+1' + number.replace('-', '')

async function sendText (to, body) {
  return client.messages.create({
    from: phoneNumber,
    body,
    to: sanitizePhoneNumber(to)
  })
}

/* UTILS */
const utils = {
  async generateWorkBlockReminder (
    terms,
    student,
    assessmentType,
    assessment,
    block
  ) {
    const lines = []
    const startStr = moment(block.startTime).format('h:mma')
    const endStr = moment(block.endTime).format('h:mma')

    lines.push(
      `Get ready to ${assessmentType === 'exam' ? 'study for' : 'work on'} ${
        assessment.title
      } from ${startStr} to ${endStr}.`
    )

    const message = lines.join('\n')
    await sendText(student.integrations.sms.phoneNumber, message)
  },
  async generateNightlyReport (terms, student, missed) {
    const currentTerm = terms.find(t => t.isCurrent)
    const lines = []
    lines.push(
      'Good evening from LATE! Here is your nightly progress report:\n'
    )
    lines.push(`[${missed.length} Missed Assignments]`)

    for (const a of missed) {
      const course = student.courseFromCRN(currentTerm.code, a.courseCRN)

      lines.push(
        `${moment(a.dueDate).format('h:mma')} - ${course.longname} - ${a.title}`
      )
    }
    const message = lines.join('\n')
    await sendText(student.integrations.sms.phoneNumber, message)
  }
}

module.exports = { client, sendText, utils }
