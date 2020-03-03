const logger = require('../../modules/logger')

const google = require('../../modules/google')

async function googleAuthMiddleware (ctx, next) {
  const auth = google.createConnection()
  auth.setCredentials(ctx.state.user.integrations.google.tokens)
  ctx.state.googleAuth = auth
  await next()
}

async function createCourseSchedule (ctx) {
  // Determine term
  let { termCode } = ctx.request.body

  if (!termCode) termCode = ctx.session.currentTerm.code

  const courses = await ctx.state.user.getCoursesForTerm(termCode)

  if (courses.length === 0) return ctx.badRequest('You have no courses for term ' + termCode)

  try {
    await google.actions.createRecurringEventsFromCourseSchedule(ctx.state.googleAuth, ctx.state.user.integrations.google.calendarID, termCode, courses)

    logger.info(
      `Created recurring GCAL events for term ${termCode} for ${
        ctx.state.user.identifier
      }`
    )
  } catch (e) {
    logger.error(`Failed to create GCal events for ${ctx.state.user.identifier}: ${e}`)
  }

  ctx.ok({
    message: 'Successfully made GCal events.'
  })
}

async function listCalendars (ctx) {
  const calendar = google.apis.calendar({
    version: 'v3',
    auth: ctx.state.googleAuth
  })
  let request
  try {
    request = await calendar.calendarList.list(ctx.request.query)
  } catch (e) {
    logger.error(
      `Failed to get GCal calendar list for ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.internalServerError(
      'There was an error getting your calendars from Google!'
    )
  }
  ctx.ok({
    calendars: request.data.items
  })
}

module.exports = {
  googleAuthMiddleware,
  listCalendars,
  createCourseSchedule
}
