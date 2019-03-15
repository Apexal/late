const { google } = require('googleapis');
const logger = require('./logger');

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
  async createEventFromWorkBlock (ctx, assessment, assessmentType, block) {
    const calendar = google.calendar({
      version: 'v3',
      auth: ctx.state.googleAuth
    });

    const assessmentURL = `https://rpi-late.herokuapp.com/${assessmentType +
      's'}/${assessment._id}`;
    const course = ctx.state.user.courseFromCRN(
      ctx.session.currentTerm.code,
      assessment.courseCRN
    );
    const capitalizedAssessmentType =
      assessmentType === 'assignment' ? 'Assignment' : 'Exam';

    let request = await calendar.events.insert({
      calendarId: ctx.state.user.integrations.google.calendarIDs.workBlocks,
      requestBody: {
        summary: `${
          assessmentType === 'assignment' ? 'Work on' : 'Study for'
        } ${assessment.title}`,
        description: `<b>${
          course.longname
        } ${capitalizedAssessmentType}</b> <i>${
          assessment.title
        }</i><br><br>${assessmentURL}`,
        source: {
          title: assessment.title,
          url: assessmentURL
        },
        extendedProperties: {
          private: {
            scheduleByLATE: true,
            assessmentID: assessment._id // links this event to the assessment
          }
        },
        ...block.asGoogleCalendarEvent
      }
    });

    logger.info(`Added GCal event for ${ctx.state.user.rcs_id}.`);
    return request.data;
  },
  async patchEventFromWorkBlock (ctx, blockID, updates) {
    const calendar = google.calendar({
      version: 'v3',
      auth: ctx.state.googleAuth
    });
    let request = await calendar.events.patch({
      calendarId: ctx.state.user.integrations.google.calendarIDs.workBlocks,
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
      calendarId: ctx.state.user.integrations.google.calendarIDs.workBlocks,
      eventId: blockID
    });

    logger.info(`Deleted work block GCal event for ${ctx.state.user.rcs_id}.`);

    return request.data;
  }
};

module.exports = {
  apis: google,
  createConnection,
  createUrl,
  actions
};
