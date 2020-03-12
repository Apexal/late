const moment = require('moment')

const Assignment = require('../api/assignments/assignments.model')

const assignmentTitleParts = [
  ['Read', 'Watch', 'Review', 'Complete', 'Do', 'Start', 'Finish', 'Read over'],
  ['Chapter %rand%', 'Textbook Chapter %rand%', 'Worksheet', 'Problem Set', 'Lab', 'Notes', 'Paper', 'Story', 'Review']
]

function generateDummyAssignment (courses, termCode, minDate, maxDate) {
  const dueTimeHours = (Math.round(Math.random() * 10) + 23)
  const dueTimeMinutes = (Math.round(Math.random() * 10) + 1)

  const daysBetween = moment(maxDate).diff(minDate, 'days')
  const randomDays = Math.floor(Math.random() * daysBetween)
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

  const time = Math.round(Math.random() * 10) + 1
  return {
    title: titlePart1 + ' ' + titlePart2,
    description: 'Dummy Assignment',
    dueDate: dueDate.toDate(),
    courseCRN,
    priority,
    timeEstimate: time,
    timeRemaining: time,
    termCode,
    comments: []
  }
}

module.exports = {
  generateDummyAssignment
}
