require('dotenv').config()

const logger = require('../modules/logger')

require('../db')

const email = require('../integrations/email')
const Student = require('../api/students/students.model')
const Assignment = require('../api/assignments/assignments.model')
const Exam = require('../api/exams/exams.model')
const Course = require('../api/courses/courses.model')
const Term = require('../api/terms/terms.model')

const moment = require('moment')

/**
 * Find a student's due assignments and exams for the upcoming week and email them a report.
 *
 * @param student Student document
 */
module.exports.sendWeeklyReportToStudent = async function sendWeeklyReportToStudent (student, weekStartDate) {
  // Validate this student can receive weekly reports
  if (student.accountLocked) {
    throw new Error(`${student.identifier}'s account is locked! They cannot receive weekly reports.`)
  }
  if (!student.reportPreferences.enabled) {
    throw new Error(`${student.identifier}'s has weekly reports disabled.`)
  }

  // If date is not given, default to closest future week
  if (weekStartDate === undefined) {
    weekStartDate = moment().startOf('day')
    while (weekStartDate.day() !== 0) {
      weekStartDate.add(1, 'day')
    }
  }

  // Find school term based on week date
  const term = await Term.findOneFromDate(weekStartDate)
  if (!term) {
    throw new Error('No term so cannot send reports.')
  }

  const dateQuery = {
    $gte: weekStartDate,
    $lt: moment(weekStartDate).add(1, 'week')
  }

  // Get assessments for that date range
  const [courses, assignments, exams] = await Promise.all([
    student.getCoursesForTerm(term.code),
    Assignment.find({ dueDate: dateQuery }).sort('dueDate'),
    Exam.find({ date: dateQuery }).sort('dueDate')
  ])

  return email.sendReportEmail(student, weekStartDate, courses, assignments.concat(exams))
}

/**
 * Find all students who can and want to receive weekly reports and send them out.
 */
module.exports.sendWeeklyReports = async function sendWeeklyReports () {
  // Find all students who want to receive reports
  const students = await Student.find({ accountLocked: false, 'reportPreferences.enabled': true })
  logger.info(`Sending week reports for ${students.length} students`)
  return await Promise.allSettled(students.map(s => module.exports.sendWeeklyReportToStudent(s)))
}
