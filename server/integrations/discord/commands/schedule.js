const Discord = require('discord.js')

const logger = require('../../../modules/logger')

const moment = require('moment')

const { getStudent } = require('../utils')

const periodTypes = {
  LEC: 'Lecture',
  LAB: 'Lab',
  TES: 'Test',
  REC: 'Recitation',
  STU: 'Studio',
  MET: 'Meeting'
}

module.exports = {
  name: 'schedule',
  alias: 's',
  uses: {
    'View your class schedule for today.': ''
  },
  dmEnabled: true,
  async run (client, terms, msg, args) {
    // Get student
    const student = await getStudent(msg.author)

    // User hasn't used LATE yet, or has not yet connected to LATE
    if (!student) {
      msg.reply(
        `You have not connected to LATE yet! Goto ${
          process.env.BASE_URL
        } to start.`
      )
    }
    // Get schedule
    // Find periods for current day
    const day = moment().day()
    const currentTerm = terms.find(t => t.isCurrent)
    const courses = await student.getCoursesForTerm(currentTerm.code).filter(course => moment().isBetween(course.startDate, course.endDate))
    const upcomingAssignments = await student.getUserAssignments({
      start: new Date()
    })

    const workBlocks = upcomingAssignments
      .map(a => {
        const blocks = a._blocks.filter(block =>
          moment(block.startTime).isSame(moment(), 'day')
        )
        blocks.forEach(b => (b.assessment = a))

        return blocks
      })
      .flat()

    const workBlockEvents = workBlocks.map(block => ({
      shared: block.shared,
      assessment: block.assessment,
      start: moment(block.startTime).format('HH:mm'),
      end: moment(block.endTime).format('HH:mm'),
      location: block.location,
      eventType: 'assessment-block',
      course: courses.find(c => c.crn === block.assessment.courseCRN)
    }))

    const dayPeriods = courses
      .map(course => {
        course.periods.forEach(
          p => (p.course = { title: course.title, crn: course.crn })
        )
        return course.periods.filter(p => p.day === day)
      })
      .flat()
    const dayPeriodEvents = dayPeriods.map(period => ({
      course: period.course,
      type: period.type,
      location: period.location,
      start: period.start,
      end: period.end,
      eventType: 'period'
    }))

    const sortedEvents = dayPeriodEvents
      .concat(workBlockEvents)
      .sort((a, b) => parseInt(a.start) - parseInt(b.start))

    const embed = new Discord.RichEmbed()
    embed.setTitle('Today\'s Schedule').setURL(process.env.BASE_URL)

    for (const i in sortedEvents) {
      const event = sortedEvents[i]

      const start = moment(event.start, 'HH:mm', true).format('h:mma')
      const end = moment(event.end, 'HH:mm', true).format('h:mma')

      if (event.eventType === 'period') {
        embed.addField(
          `${event.course.title} ${periodTypes[event.type] || event.type}`,
          `${start} - ${end} | *${event.location}*`
        )
      } else if (event.eventType === 'assessment-block') {
        embed.addField(
          `${
            event.assessment.assessmentType === 'assignment'
              ? 'Work on'
              : 'Study for'
          } ${event.course.title} "${event.assessment.title}"`,
          `${start} - ${end}${event.location ? ' | ' + event.location : ''}`
        )
      }
    }
    embed.setFooter(`As of ${moment().format('MM/DD/YY h:mm a')} on LATE`)

    msg.author.send(embed)
  }
}
