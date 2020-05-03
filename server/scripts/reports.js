require('dotenv').config()

const logger = require('../modules/logger')

require('../db')

const email = require('../integrations/email')
const Student = require('../api/students/students.model')
const Assignment = require('../api/assignments/assignments.model')
const Exam = require('../api/exams/exams.model')

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

  const dateQuery = {
    $gte: weekStartDate,
    $lt: moment(weekStartDate).add(1, 'week')
  }

  // Get assessments for that date range
  const [assignments, exams] = await Promise.all([Assignment.find({ dueDate: dateQuery }).sort('dueDate'), Assignment.find({ date: dateQuery }).sort('dueDate')])
  console.log(weekStartDate)
  console.log(assignments)
  console.log(exams)

  return [assignments, exams]
}

/**
 * Find all students who can and want to receive weekly reports and send them out.
 */
module.exports.sendWeeklyReports = async function sendWeeklyReports () {
  // Find all students who want to receive reports
  const students = await Student.find({ accountLocked: false, 'reportPreferences.enabled': true })
  console.log(students)
  console.log(await Promise.allSettled(students.map(s => module.exports.sendWeeklyReportToStudent(s))))
}
