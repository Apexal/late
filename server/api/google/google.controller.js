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

  let request;
  try {
    request = await calendar.events.insert({
      calendarId: ctx.request.body.calendarId,
      resource: ctx.request.body
    });
  } catch (e) {
    logger.error(
      `Failed to create GCal event for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest(
      'There was an error creating a new Google Calendar event.'
    );
  }

  logger.info(`Added GCal event for ${ctx.state.user.rcs_id}`);

  ctx.ok({
    event: request.data
  });
}

async function patchEvent (ctx) {
  const calendar = google.apis.calendar({
    version: 'v3',
    auth: ctx.state.googleAuth
  });
  const { calendarId, eventId } = ctx.params;
  let request;
  try {
    request = await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: ctx.request.body
    });
  } catch (e) {
    logger.error(
      `Failed to patch GCal event ${eventId} for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest(
      'There was an error updating the Google Calendar event.'
    );
  }

  logger.info(`Patched GCal event for ${ctx.state.user.rcs_id}.`);

  return ctx.ok({
    updatedEvent: request.data
  });
}

async function deleteEvent (ctx) {
  const calendar = google.apis.calendar({
    version: 'v3',
    auth: ctx.state.googleAuth
  });

  const { calendarId, eventId } = ctx.params;
  // TODO: make sure event was scheduled by LATE
  let request;
  try {
    request = await calendar.events.delete({ calendarId, eventId });
  } catch (e) {
    logger.error(
      `Failed to delete GCal event ${eventId} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest(
      'There was an error deleting the Google Calendar event.'
    );
  }

  logger.info(`Deleted GCal event for ${ctx.state.user.rcs_id}.`);

  return ctx.ok({
    deletedEvent: request.data
  });
}

module.exports = {
  googleAuthMiddleware,
  listCalendars,
  createEvent,
  patchEvent,
  deleteEvent
};
