const moment = require('moment')

const Assignment = require('../api/assignments/assignments.model')

const assignmentTitleParts = [
  ['Read', 'Watch', 'Review', 'Complete', 'Do', 'Start', 'Finish'],
  ['Chapter %rand%', 'Textbook Chapter %rand%', 'Worksheet', 'Problem Set', 'Lab', 'Notes']
]

function generateDummyAssignment (courses, termCode, minDate, maxDate) {
  const dueTimeHours = 18
  const dueTimeMinutes = 30

  const daysBetween = maxDate.diff(minDate, 'days')
  const randomDays = Math.floor(Math.random() * ((daysBetween - 10) - 10)) + 10
  const dueDate = moment(minDate).add(randomDays, 'days')
  dueDate.hours(dueTimeHours)
  dueDate.minutes(dueTimeMinutes)

  const priorityRandom = Math.random()
  let priority
  if (priorityRandom > 0.8) {
    priority = 5
  } else if (priorityRandom > 0.6) {
    priority = 4
  } else if (priorityRandom > 0.3) {
    priority = 3
  } else if (priorityRandom > 0.2) {
    priority = 2
  } else {
    priority = 1
  }

  const titlePart1 = assignmentTitleParts[0][Math.floor(Math.random() * assignmentTitleParts[0].length)]
  let titlePart2 = assignmentTitleParts[1][Math.floor(Math.random() * assignmentTitleParts[1].length)]

  if (titlePart2.includes('%rand%')) {
    titlePart2 = titlePart2.replace('%rand%', Math.floor(Math.random() * 10) + 1)
  }

  const courseCRN = courses[Math.floor(Math.random() * courses.length)].crn

  return {
    title: titlePart1 + ' ' + titlePart2,
    description: 'Dummy Assignment',
    dueDate: dueDate.toDate(),
    courseCRN,
    priority,
    termCode,
    comments: []
  }
}

module.exports = {
  generateDummyAssignment
}

const startDate = moment().subtract(20, 'days')
const endDate = moment().add(20, 'days')

const courses = [
  { crn: 1 },
  { crn: 2 },
  { crn: 3 },
  { crn: 4 }
]

console.log(generateDummyAssignment(courses, 201909, startDate, endDate))