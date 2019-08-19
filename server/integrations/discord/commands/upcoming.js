const Discord = require('discord.js')
const moment = require('moment')

const logger = require('../../../modules/logger')
const { getStudent } = require('../utils')

module.exports = {
  name: 'upcoming',
  alias: 'u',
  uses: {
    'View your upcoming assignments.': ''
  },
  dmEnabled: true,
  async run (client, terms, msg, args) {
    // Get student's upcoming assignments
    const student = await getStudent(msg.author)

    // User hasn't used LATE yet, or has not yet connected to LATE
    if (!student) {
      msg.reply(
        `You have not connected to LATE yet! Goto ${
          process.env.BASE_URL
        } to start.`
      )
      return
    }
    const currentTerm = terms.find(t => t.isCurrent)

    // Find upcoming assignments (dueDate is after current datetime)
    const ass = await student.getUserAssignments({ start: new Date() })
    const courses = await student.getCoursesForTerm(currentTerm.code)
    const upcomingAssignments = ass.filter(a => !a.completed)

    // Group by due dates
    const grouped = {}
    for (const a of upcomingAssignments) {
      const day = moment(new Date(a.dueDate))
        .startOf('day')
        .toDate()

      if (!grouped[day]) grouped[day] = []

      grouped[day].push(a)
    }

    // Create fancy embed message to display info better
    const embed = new Discord.RichEmbed()
      .setTitle(
        `Upcoming Incomplete Assignments (${upcomingAssignments.length})`
      )
      .setURL(process.env.BASE_URL + '/coursework/upcoming')
      .setFooter(`As of ${moment().format('MM/DD/YY h:mm a')} on LATE`)

    for (const date in grouped) {
      embed.addField(
        moment(new Date(date)).format('dddd [the] Do'),
        grouped[date]
          .map(a => {
            const course = courses.find(c => c.crn === a.courseCRN)

            return `**${course.title}:** ${a.title} *(${moment(
              a.dueDate
            ).format('h:mma')})*`
          })
          .join('\n'),
        true
      )
    }

    msg.author.send(embed)
  }
}
