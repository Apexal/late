const logger = require('../modules/logger')
const moment = require('moment')

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const GENERTIC_SENDGRID_TEMPLATE_ID = 'd-78a8680f9b724f5196f497857c433c7c'
const WEEKLY_REPORTS_SENDGRID_TEMPLATE_ID = 'd-26a7611dfe78488caa8903c1a1c4267a'

const emailFunctions = {
  async sendGenericEmail (rcsID, subject, data) {
    return sgMail.send({
      to: rcsID + '@rpi.edu',
      from: 'LATE <noreply@late.work>',
      subject,
      templateId: GENERTIC_SENDGRID_TEMPLATE_ID,
      dynamic_template_data: { ...data, subject }
    })
  },
  async sendNewUserEmail (rcsID) {
    logger.info(`Sending new user email to ${rcsID}@rpi.edu`)
    return sgMail.send({
      to: rcsID + '@rpi.edu',
      from: 'LATE <thefrankmatranga@gmail.com>',
      subject: 'Welcome to LATE',
      templateId: 'd-eeae1b92ce924dc3be9253bf2d5576a3',
      dynamic_template_data: {
        rcsID
      }
    })
  },
  async sendReportEmail (student, startDate, courses, assessments) {
    const weekDisplay = moment(startDate).format('MMM Do')

    const days = new Array(7).fill({})
    for (const dayIndex in days) {
      const date = moment(startDate).add(dayIndex, 'days').startOf('day')
      const dateAssessments = assessments.filter(a => moment(a.date).isSame(date, 'day'))

      days[dayIndex] = {
        dateDisplay: date.format('dddd [the] Do'),
        assessments: dateAssessments.map(a => ({
          courseTitle: courses.find(c => c.crn === a.courseCRN)?.title ?? 'Removed Course',
          title: a.title,
          assessmentType: a.assessmentType,
          dueDisplay: moment(a.date).format('h:mm a'),
          link: `https://www.late.work/coursework/${a.assessmentType.charAt(0)}/${a._id}`
        }))
      }
      console.log(days[dayIndex].assessments)
    }

    logger.info(`Sending report email to ${student.identifier}`)
    return sgMail.send({
      to: student.rcs_id + '@rpi.edu',
      from: 'LATE <reports@late.work>',
      templateId: WEEKLY_REPORTS_SENDGRID_TEMPLATE_ID,
      dynamic_template_data: {
        subject: `Coursework Report for Week of ${weekDisplay}`,
        student,
        weekDisplay,
        days,
        quote: {
          text: 'Better LATE than never!',
          author: 'SIS Man'
        }
      }
    })
  }
}

module.exports = emailFunctions
