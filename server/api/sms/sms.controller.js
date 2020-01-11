const logger = require('../../modules/logger')

const Student = require('../students/students.model')

const moment = require('moment')

async function findStudentFromSMSMiddleware (ctx, next) {
  // Find user with that phone number
  const student = await Student.findOne({
    'integrations.sms.phoneNumber': ctx.request.body.UserIdentifier.substring(2)
  })
  if (!student) {
    return ctx.ok({
      actions: [{
        redirect: 'task://unknown_user'
      }]
    })
  } else {
    ctx.state.student = student
    return next()
  }
}

async function upcoming (ctx) {
  logger.info(`[autopilot] ${ctx.state.student.rcs_id} requested upcoming coursework`)

  const courses = (await ctx.state.student.getCoursesForTerm(ctx.session.currentTerm.code))

  const upcomingAssignments = await ctx.state.student.getUserAssignments({
    start: moment().format('YYYY-MM-DD'),
    end: moment().add(3, 'weeks').format('YYYY-MM-DD')
  })

  const upcomingExams = await ctx.state.student.getExams(
    moment().format('YYYY-MM-DD'),
    moment().add(3, 'weeks').format('YYYY-MM-DD'))

  const assessments = upcomingAssignments.concat(upcomingExams).sort((a, b) => a.date - b.date)

  const lines = assessments.map(as => `[${moment(as.date).format('D/M/YY')}] ${courses.find(c => c.crn === as.courseCRN).title}: ${as.title}`)

  return ctx.ok({
    actions: [
      {
        say: `You have ${assessments.length} upcoming assignments and exams:\n\n` + lines.join('\n') + '\n\nAnything else?'
      },
      {
        listen: true
      }
    ]
  })
}

async function agenda (ctx) {
  logger.info(`[autopilot] ${ctx.state.student.rcs_id} requested today's agenda`)

  const today = moment().day()
  const courses = (await ctx.state.student.getCoursesForTerm(ctx.session.currentTerm.code))
    .filter(course => moment().isBetween(course.startDate, course.endDate))

  let events = []
  for (const course of courses) {
    const periods = course.periods.filter(period => period.day === today)
    if (periods.length === 0) continue

    for (const period of periods) {
      events.push({ startTime: moment(period.start, 'HH:mm'), text: `${course.title} ${period.type}` })
    }
  }

  const upcomingAssignments = await ctx.state.student.getUserAssignments({
    start: moment().format('YYYY-MM-DD'),
    end: moment().add(3, 'weeks').format('YYYY-MM-DD')
  })

  for (const assignment of upcomingAssignments) {
    for (const block of assignment._blocks.filter(block => moment().isSame(block.startTime, 'day'))) {
      events.push({ startTime: moment(block.startTime, 'HH:mm'), text: `Work on ${assignment.title}` })
    }
  }

  const upcomingExams = await ctx.state.student.getExams(
    moment().format('YYYY-MM-DD'),
    moment().add(3, 'weeks').format('YYYY-MM-DD'))

  for (const exam of upcomingExams) {
    for (const block of exam._blocks.filter(block => moment().isSame(block.startTime, 'day'))) {
      events.push({ startTime: moment(block.startTime, 'HH:mm'), text: `Study for ${exam.title}` })
    }
  }

  events = events.sort((a, b) => a.startTime - b.startTime)

  const lines = events.map(ev => `[${ev.startTime.format('h:mm a')}] ${ev.text}`)

  return ctx.ok({
    actions: [
      {
        say: `You have ${events.length} events scheduled for today:\n\n` + lines.join(' \n') + '\n\nAnything else?'
      },
      {
        listen: true
      }
    ]
  })
}

module.exports = {
  findStudentFromSMSMiddleware,
  upcoming,
  agenda
}
