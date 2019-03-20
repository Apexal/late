const logger = require('../../modules/logger');

const google = require('../../modules/google');

async function googleAuthMiddleware (ctx, next) {
  const auth = google.createConnection();
  auth.setCredentials(ctx.state.user.integrations.google.tokens);
  ctx.state.googleAuth = auth;
  await next();
}

async function listCalendars (ctx) {
  const calendar = google.apis.calendar({
    version: 'v3',
    auth: ctx.state.googleAuth
  });
  let request;
  try {
    request = await calendar.calendarList.list(ctx.request.query);
  } catch (e) {
    logger.error(
      `Failed to get GCal calendar list for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.internalServerError(
      'There was an error getting your calendars from Google!'
    );
  }
  ctx.ok({
    calendars: request.data.items
  });
}

async function createCalendar (ctx) {
  const calendar = google.apis.calendar({
    version: 'v3',
    auth: ctx.state.googleAuth
  });

  const { calendarType, summary, description } = ctx.request.body;

  let request;
  try {
    request = await calendar.calendars.insert({
      requestBody: {
        summary,
        description,
        timeZone: 'America/New_York',
        location: 'RPI'
      }
    });
  } catch (e) {
    logger.error(
      `Failed to create new calendar for ${ctx.state.user.rcs_id}: ${e}`
    );
    return CryptoKey.badRequest('Failed to create new Google Calendar.');
  }
  console.log(request.data);

  ctx.state.user.integrations.google.calendarIDs[calendarType] =
    request.data.id;
  await ctx.state.user.save();

  ctx.ok(request.data);
}

module.exports = {
  googleAuthMiddleware,
  listCalendars,
  createCalendar
};
