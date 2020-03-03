/*
// FOR TESTING
require('dotenv').config();
require('../db');
*/

const moment = require('moment')
const Term = require('../../api/terms/terms.model')
const Student = require('../../api/students/students.model')
const Block = require('../../api/blocks/blocks.model')

function duration (timeStr1, timeStr2) {
  return moment(timeStr2, 'HH:mm', true).diff(
    moment(timeStr1, 'HH:mm', true),
    'minutes'
  )
}

/**
 * Get a list of open work blocks: the inverse of the user's course and unvailability schedule
 * for a given time span.
 *
 * @argument {Object} student
 * @returns {Array} open work blocks { start: Moment, end: Moment, duration: Number }
 */
function compileWeeklyOpenSchedule (currentTerm, student) {
  // Firstly compile the busy schedule by combining course and unavailability
  const courseSchedule = student.semester_schedules[currentTerm.code]
    .map(c => c.periods)
    .flat()
    .map(p => ({
      start: moment(p.start, 'HH:mm', true).format('HH:mm'),
      end: moment(p.end, 'HH:mm', true)
        .add(10, 'minutes') // We add ten minutes because classes end 10 to the hour
        .format('HH:mm'),
      day: p.day
    }))

  // eslint-disable-next-line standard/computed-property-even-spacing
  const unavailabilitySchedule = student.unavailability_schedules[
    currentTerm.code
  ].map(p => ({
    start: p.start,
    end: p.end,
    day: p.dow[0]
  }))

  const busySchedule = courseSchedule
    .concat(unavailabilitySchedule)
    .sort((p1, p2) => {
      if (p1.start < p2.start) return -1
      else if (p1.start > p2.start) return 1
      else return 0
    })

  const openSchedule = []
  const startTime = student.earliestWorkTime
  const endTime = student.latestWorkTime
  for (let day = 0; day < 7; day++) {
    // Loop through each day
    const dayBusy = busySchedule.filter(p => p.day === day)

    // Find empty blocks and add them to openSchedule
    let prevEnd = startTime
    for (let i = 0; i < dayBusy.length; i++) {
      const period = dayBusy[i]

      if (prevEnd !== period.start) {
        // Gap!!!!
        openSchedule.push({
          day,
          start: prevEnd,
          end: period.start,
          duration: duration(prevEnd, period.start)
        })
      }
      prevEnd = period.end
    }

    // Check for end of day block
    if (prevEnd !== endTime) {
      openSchedule.push({
        day,
        start: prevEnd,
        end: endTime,
        duration: duration(prevEnd, endTime)
      })
    }
  }

  return openSchedule
}

module.exports = {
  compileWeeklyOpenSchedule
}

/*
(async function () {
  const student = await Student.findOne().byUsername('matraf');
  const currentTerm = (await Term.find()).find(t => t.isCurrent);

  const openSchedule = compileWeeklyOpenSchedule(currentTerm, student);
  console.log(openSchedule);
})();
*/
