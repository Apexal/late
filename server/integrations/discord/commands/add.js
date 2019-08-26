const Discord = require('discord.js')

const logger = require('../../../modules/logger')

const moment = require('moment')

const { getStudent } = require('../utils')

const Assignment = require('../../../api/assignments/assignments.model')
const Exam = require('../../../api/exams/exams.model')

module.exports = {
  name: 'add',
  alias: 'a',
  uses: {
    'Add an assignment or exam.': ''
  },
  dmEnabled: true,
  async run (client, terms, msg, args) {
    // Get student
    const student = await getStudent(msg.author)

    const currentTerm = terms.find(t => t.isCurrent)
    if (!student.terms.includes(currentTerm.code)) return msg.author.send('You are on break!')

    const courses = await student.getCoursesForTerm(currentTerm.code)

    // User hasn't used LATE yet, or has not yet connected to LATE
    if (!student) {
      return msg.reply(
        `You have not connected to LATE yet! Goto ${
          process.env.BASE_URL
        } to start.`
      )
    }

    try {
      await msg.delete()
    } catch (e) {

    }

    let collected

    // ASSESSMENT TYPE
    const assessmentTypeMessage = await msg.author.send('Do you want to add an **🇦ssignment** or **🇪xam**?')
    assessmentTypeMessage.react('🇦')
    assessmentTypeMessage.react('🇪')
    const assessmentTypeEmojifilter = (reaction, user) => {
      return (reaction.emoji.name === '🇦' || reaction.emoji.name === '🇪') && user.id === msg.author.id
    }
    try {
      collected = await assessmentTypeMessage.awaitReactions(assessmentTypeEmojifilter, { max: 1, time: 30000, errors: ['time'] })
    } catch (e) {
      assessmentTypeMessage.edit('You didn\'t choose... Cancelling.')
      assessmentTypeMessage.clearReactions()
      return
    }
    const assessmentType = collected.has('🇦') ? 'assignment' : 'exam'

    // COURSE
    const coursePrompt = await msg.author.send(`What **course** is this ${assessmentType} for? *You can don't have to type the whole course title.*`)
    const courseFilter = response => {
      return response.author.id === msg.author.id && courses.some(c => c.title.toLowerCase().startsWith(response.content.toLowerCase()))
    }
    try {
      collected = await msg.author.dmChannel.awaitMessages(courseFilter, { maxMatches: 1, time: 30000, errors: ['time'] })
    } catch (e) {
      coursePrompt.edit('You didn\'t give a valid name. Cancelled.')
      return
    }
    const courseNameMessage = collected.first()
    const course = courses.find(c => c.title.toLowerCase().startsWith(courseNameMessage.content.toLowerCase()))

    // TITLE
    const titlePrompt = await msg.author.send(`What's the ${assessmentType}'s **title**?`)
    const titleFilter = response => {
      return response.author.id === msg.author.id
    }
    try {
      collected = await msg.author.dmChannel.awaitMessages(titleFilter, { maxMatches: 1, time: 30000, errors: ['time'] })
    } catch (e) {
      titlePrompt.edit('You didn\'t give a title. Cancelled')
      return
    }
    const titleMessage = collected.first()
    const title = titleMessage.content

    // DATE
    const datePrompt = msg.author.send(`When's the ${assessmentType} **due**? \`${moment().format('M/D/YY h:mm a')}\``)
    const dueFilter = response => {
      return response.author.id === msg.author.id && moment(response.content, 'M/D/YY h:mm a').isValid()
    }
    try {
      collected = await msg.author.dmChannel.awaitMessages(dueFilter, { maxMatches: 1, time: 30000, errors: ['time'] })
    } catch (e) {
      datePrompt.edit('You didn\'t give a valid date and time. Cancelled.')
      return
    }
    const dueDateMessage = collected.first()
    const dueDate = moment(dueDateMessage.content, 'M/D/YY h:mm a')

    const controlMessage = await msg.author.send(`Creating ${course.title} ${assessmentType} "${title}" due *${dueDate.fromNow()}*...`)

    // CREATE ASSESSMENT
    if (assessmentType === 'assignment') {
      const assignmentData = {
        _student: student,
        title,
        dueDate: dueDate.toDate(),
        courseCRN: course.crn,
        timeEstimate: 2,
        timeRemaining: 2
      }
      const newAssignment = new Assignment(assignmentData)
      try {
        await newAssignment.save()
      } catch (e) {
        controlMessage.edit(`There was an error... ${e}`)
      }

      controlMessage.edit(`**Success!** | View the assignment at ${process.env.BASE_URL}/coursework/a/${newAssignment._id}`)
      logger.info(`Created new assignment for ${student.rcs_id} from Discord.`)
    } else {
      const examData = {
        _student: student,
        title,
        date: dueDate.toDate(),
        courseCRN: course.crn,
        timeEstimate: 5,
        timeRemaining: 5
      }
      const newExam = new Exam(examData)
      try {
        await newExam.save()
      } catch (e) {
        controlMessage.edit(`There was an error... ${e}`)
      }

      controlMessage.edit(`**Success!** | View the exam at ${process.env.BASE_URL}/coursework/e/${newExam._id}`)
      logger.info(`Created new exam for ${student.rcs_id} from Discord.`)
    }
  }
}
