const logger = require('../../modules/logger');

const google = require('../../modules/google');

async function googleAuthMiddleware (ctx, next) {
  const auth = google.createConnection();
  auth.setCredentials(ctx.state.user.integrations.google.accessTokens);
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

async function createEvent (ctx) {
  const calendar = google.apis.calendar({
    version: 'v3',
    auth: ctx.state.googleAuth
  });

  // const { calendarID, start, end, summary, description, location, extendedProperties } = ctx.request.body;

  let request;
  request = await calendar.events.insert(ctx.request.body);

  logger.info(`Added GCal event for ${ctx.state.user.rcs_id}`);

  ctx.ok({
    event: request.data
  });
}

module.exports = {
  googleAuthMiddleware,
  listCalendars,
  createEvent
};
