const { google } = require('googleapis')
const logger = require('./logger')
const moment = require('moment')

const RRule = require('rrule').RRule

const dayAbbreviations = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
const periodTypes = {
  LEC: 'Lecture',
  LAB: 'Lab',
  TES: 'Test',
  REC: 'Recitation',
  STU: 'Studio',
  MET: 'Meeting'
}

function createConnection () {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  )
}

function createUrl (auth) {
  return auth.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  })
}

function createAuth (tokens) {
  const auth = createConnection()
  auth.setCredentials(tokens)
  return auth
}

const scopes = ['https://www.googleapis.com/auth/calendar']

const actions = {
  /**
   * Create a GCal event for a work/course/todo block
   *
   * @param {Student document} user
   * @param {String} currentTermCode
   * @param {Assignent/Exam/Course/Todo document} item
   * @param {Block document} block
   */
  async createBlockEvent (user, termCode, item, block) {
    const calendar = google.calendar({
      version: 'v3',
      auth: createAuth(user.integrations.google.tokens)
    })

    let colorId, summary, description, source, extendedPrivateProperties

    if (block.blockType === 'assessment') {
      const assessment = item
      const { assessmentType } = assessment

      // Link to assessment
      const assessmentURL = `${
        process.env.BASE_URL
      }/coursework/${assessmentType.charAt(0)}/${assessment._id}`

      const capitalizedAssessmentType =
      assessmentType === 'assignment' ? 'Assignment' : 'Exam'

      colorId = assessment.assessmentType === 'assignment' ? 9 : 11
      // Event title
      summary = `${
        assessment.assessmentType === 'assignment' ? 'Work on' : 'Study for'
      } ${assessment.title}`

      const course = await user.courseFromCRN(
        termCode,
        assessment.courseCRN
      )

      description = `<b>${
        course.title
      } ${capitalizedAssessmentType}</b> <i>${
        assessment.title
      }</i><br><blockquote>${assessment.description}</blockquote><br>${assessmentURL}`

      source = {
        title: assessment.title,
        url: assessmentURL
      }

      extendedPrivateProperties = {
        assessmentID: assessment._id
      }
    } else if (block.blockType === 'course') {
      colorId = 10
      summary = `Study for ${item.title}`
      description = item.originalTitle
      extendedPrivateProperties = {
        courseID: item.id
      }
    } else if (block.blockType === 'todo') {
      colorId = 9
      summary = `Work on TODO ${item.text}`
      description = 'TODO'
      extendedPrivateProperties = {
        todoID: item.id
      }
    }

    // Make request to Google Calendar API to create event
    const request = await calendar.events.insert({
      calendarId: user.integrations.google.calendarID,
      requestBody: {
        colorId,
        location: block.location,
        summary,
        description,
        guestsCanInviteOthers: false,
        source,
        extendedProperties: {
          private: {
            scheduledByLATE: true,
            blockID: block.id, // Links this event to the block
            ...extendedPrivateProperties // Links this event to the assessment
          }
        },
        ...block.asGoogleCalendarEvent // Start and end dates, etc.
      }
    })

    return request.data
  },
  async patchEvent (user, blockID, updates) {
    const calendar = google.calendar({
      version: 'v3',
      auth: createAuth(user.integrations.google.tokens)
    })
    const request = await calendar.events.patch({
      calendarId: user.integrations.google.calendarID,
      eventId: blockID,
      requestBody: updates
    })

    return request.data
  },
  /**
   * Delete a Google Calendar event from a student's connected calendar.
   *
   * @param {Object} googleIntegration Object with `calendarId` and `tokens`
   * @param {String} eventId String ID of the GCal event to delete
   */
  async deleteEvent (user, eventId) {
    const calendar = google.calendar({
      version: 'v3',
      auth: createAuth(user.integrations.google.tokens)
    })

    const request = await calendar.events.delete({
      calendarId: user.integrations.google.calendarID,
      eventId
    })

    return request.data
  },
  async deleteWorkBlockEventsForAssessment (ctx, assessment, cutoffDate) {
    const calendar = google.calendar({
      version: 'v3',
      auth: ctx.state.googleAuth
    })

    // const request = await calendar.events.delete({
    //   calendarId: ctx.state.user.integrations.google.calendarID,
    //   eventId: blockID
    // })

    const request = await calendar.events.list({
      calendarId: ctx.state.user.integrations.google.calendarID,
      privateExtendedProperty: '',
      timeMin: cutoffDate
    })

    return request.data
  },
  /**
   * Fill a calendar with class events with period type, location, and proper range.
   *
   * @param {Google API auth object} googleAuth
   * @param {string} calendarId The string ID of the calendar to add events to
   * @param {string} termCode The term code of the semester the courses are from (e.g. '201901')
   * @param {array} courses The array of course objects to generate period events from
   */
  async createRecurringEventsFromCourseSchedule (googleAuth, calendarId, termCode, courses) {
    // TODO: fix bug

    // const calendar = google.calendar({
    //   version: 'v3',
    //   auth: googleAuth
    // })

    // for (let i = 0; i < courses.length; i++) {
    //   const course = courses[i]

    //   if (course.periods.length === 0) continue

    //   // Determine if this was done already
    //   logger.info('Conditionally creating course events for ' + course.title)
    //   const request = await calendar.events.list({
    //     calendarId,
    //     privateExtendedProperty: [
    //       'createdBy=LATE',
    //       'termCode=' + termCode,
    //       'courseID=' + course._id
    //     ]
    //   })

    //   const existingCourseCalendarEvents = request.data.items

    //   const orphanedEventIDs = existingCourseCalendarEvents.map(ev => ev.id).filter(eventID => !course.periods.id(eventID))

    //   orphanedEventIDs.forEach(id => calendar.events.delete({
    //     calendarId,
    //     eventId: id
    //   }))

    //   const courseStart = moment(course.startDate)
    //   const courseEnd = moment(course.endDate)

    //   for (const period of course.periods) {
    //     const start = moment(
    //       courseStart.format('YYYY-MM-DD') + ' ' + period.start,
    //       'YYYY-MM-DD HH:mm',
    //       true
    //     )
    //     while (start.day() !== period.day) {
    //       start.add(1, 'day')
    //     }

    //     const end = moment(
    //       start.format('YYYY-MM-DD') + ' ' + period.end,
    //       'YYYY-MM-DD HH:mm',
    //       true
    //     )
    //     const recurrence = new RRule({
    //       freq: RRule.WEEKLY,
    //       byweekday: [RRule[dayAbbreviations[period.day]]],
    //       until: courseEnd.toDate()
    //     })

    //     const locationParts = period.location.split(' ')
    //     const location =
    //       `${locationParts.slice(0, locationParts.length - 1).join(' ')} #${locationParts[locationParts.length - 1]}, Troy, NY 12180`

    //     const data = {
    //       id: period._id,
    //       summary: `${course.title} ${periodTypes[period.type] ||
    //         period.type}`,
    //       description: `${course.summary} - ${course.sectionId} - ${
    //         course.credits
    //       } credits`,
    //       location,
    //       colorId: i % 12,
    //       source: {
    //         title: 'Course Page',
    //         url: process.env.BASE_URL + '/account/courseschedule'
    //       },
    //       start: {
    //         dateTime: start.toDate(),
    //         timeZone: 'America/New_York'
    //       },
    //       end: {
    //         dateTime: end.toDate(),
    //         timeZone: 'America/New_York'
    //       },
    //       recurrence: [recurrence.toString()],
    //       extendedProperties: {
    //         private: {
    //           createdBy: 'LATE',
    //           termCode,
    //           courseID: course._id, // links this event to the course
    //           periodType: period.type,
    //           periodID: period._id
    //         }
    //       }
    //     }

    //     const calendarEvent = existingCourseCalendarEvents.find(ev => ev.extendedProperties.private.periodID === period.id)
    //     if (calendarEvent) {
    //       await calendar.events.patch({
    //         calendarId,
    //         eventId: calendarEvent.id,
    //         requestBody: data
    //       })
    //     } else {
    //       await calendar.events.insert({
    //         calendarId,
    //         requestBody: data
    //       })
    //     }
    //   }
    // }
  }
}

module.exports = {
  apis: google,
  createConnection,
  createAuth,
  createUrl,
  actions
}
