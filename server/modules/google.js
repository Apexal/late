const { google } = require('googleapis');
const logger = require('./logger');
const moment = require('moment');

const RRule = require('rrule').RRule;

const dayAbbreviations = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const periodTypes = {
  LEC: 'Lecture',
  LAB: 'Lab',
  TES: 'Test',
  REC: 'Recitation',
  STU: 'Studio'
};

function createConnection () {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );
}

function createUrl (auth) {
  return auth.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });
}
const scopes = ['https://www.googleapis.com/auth/calendar'];

const actions = {
  async createEventFromWorkBlock (googleAuth, currentTerm, user, assessment, block) {
    const { assessmentType } = assessment;
    const calendar = google.calendar({
      version: 'v3',
      auth: googleAuth
    });

    const assessmentURL = `${
      process.env.BASE_URL
    }/coursework/${assessmentType.charAt(0)}/${assessment._id}`;
    const course = await user.courseFromCRN(
      currentTerm.code,
      assessment.courseCRN
    );
    const capitalizedAssessmentType =
    assessmentType === 'assignment' ? 'Assignment' : 'Exam';

    let request = await calendar.events.insert({
      calendarId: user.integrations.google.calendarID,
      requestBody: {
        colorId: assessment.assessmentType === 'assignment' ? 9 : 11,
        summary: `${
          assessment.assessmentType === 'assignment' ? 'Work on' : 'Study for'
        } ${assessment.title}`,
        description: `<b>${
          course.title
        } ${capitalizedAssessmentType}</b> <i>${
          assessment.title
        }</i><br><blockquote>${assessment.description}</blockquote><br>${assessmentURL}`,
        source: {
          title: assessment.title,
          url: assessmentURL
        },
        organizer: {
          displayName: user.displayName,
          email: user.rcs_id + '@rpi.edu'
        },
        locked: true,
        guestsCanInviteOthers: false,
        extendedProperties: {
          private: {
            scheduledByLATE: true,
            assessmentID: assessment._id // links this event to the assessment
          }
        },
        ...block.asGoogleCalendarEvent
      }
    });

    logger.info(`Added GCal event for ${user.rcs_id}.`);
    return request.data;
  },
  async patchEventFromWorkBlock (googleAuth, user, blockID, updates) {
    const calendar = google.calendar({
      version: 'v3',
      auth: googleAuth
    });
    let request = await calendar.events.patch({
      calendarId: user.integrations.google.calendarID,
      eventId: blockID,
      requestBody: updates
    });

    return request.data;
  },
  async deleteEventFromWorkBlock (ctx, blockID) {
    const calendar = google.calendar({
      version: 'v3',
      auth: ctx.state.googleAuth
    });

    let request = await calendar.events.delete({
      calendarId: ctx.state.user.integrations.google.calendarID,
      eventId: blockID
    });

    logger.info(`Deleted work block GCal event for ${ctx.state.user.rcs_id}.`);

    return request.data;
  },
  async createRecurringEventsFromCourseSchedule (googleAuth, calendarId, termCode, courses) {
    const calendar = google.calendar({
      version: 'v3',
      auth: googleAuth
    });

    for (let course of courses) {
      if (course.periods.length === 0) continue;

      // Determine if this was done already
      logger.info('Conditionally creating course events for ' + course.title);
      let request = await calendar.events.list({
        calendarId,
        privateExtendedProperty: [
          'createdBy=LATE',
          'termCode=' + termCode,
          'courseID=' + course._id
        ]
      });

      const existingCourseCalendarEvents = request.data.items;
      // console.log(existingCourseCalendarEvents.map(ev => ev.extendedProperties.private));

      const courseStart = moment(course.startDate);
      const courseEnd = moment(course.endDate);

      for (let period of course.periods) {
        const start = moment(
          courseStart.format('YYYY-MM-DD') + ' ' + period.start,
          'YYYY-MM-DD Hmm',
          true
        );
        while (start.day() !== period.day) {
          start.add(1, 'day');
        }

        const end = moment(
          start.format('YYYY-MM-DD') + ' ' + period.end,
          'YYYY-MM-DD Hmm',
          true
        );
        const recurrence = new RRule({
          freq: RRule.WEEKLY,
          byweekday: [RRule[dayAbbreviations[period.day]]],
          until: courseEnd.toDate()
        });

        let locationParts = period.location.split(' ');
        let location =
          locationParts.slice(0, locationParts.length - 1).join(' ') +
          ', Troy, NY 12180';

        const data = {
          summary: `${course.title} ${periodTypes[period.type] ||
            period.type}`,
          description: `${course.summary} - ${course.sectionId} - ${
            course.credits
          } credits`,
          location,
          source: {
            title: 'Course Page',
            url: process.env.BASE_URL + '/account/courseschedule'
          },
          start: {
            dateTime: start.toDate(),
            timeZone: 'America/New_York'
          },
          end: {
            dateTime: end.toDate(),
            timeZone: 'America/New_York'
          },
          recurrence: [recurrence.toString()],
          extendedProperties: {
            private: {
              createdBy: 'LATE',
              termCode,
              courseID: course._id, // links this event to the course
              periodType: period.type,
              periodID: period.id
            }
          }
        };

        const calendarEvent = existingCourseCalendarEvents.find(ev => ev.extendedProperties.private.courseID === course.id && ev.extendedProperties.private.periodID === period.id);
        if (calendarEvent) {
          let request = await calendar.events.patch({
            calendarId,
            eventId: calendarEvent.id,
            requestBody: data
          });
        } else {
          let request = await calendar.events.insert({
            calendarId,
            requestBody: data
          });
        }
      }
    }
  }
};

module.exports = {
  apis: google,
  createConnection,
  createUrl,
  actions
};
