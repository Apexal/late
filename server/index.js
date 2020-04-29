/* Koa dependencies */
const Koa = require('koa')
const Router = require('koa-router')
const Logger = require('koa-logger')
const Static = require('koa-static')
const Helmet = require('koa-helmet')
const Session = require('koa-session')
const Body = require('koa-body')
const Respond = require('koa-respond')
const Send = require('koa-send')
const Compress = require('koa-compress')

const google = require('./modules/google')
const moment = require('moment')
const passport = require('koa-passport')
// Start the Discord bot
const discordClient = require('./integrations/discord').client

const logger = require('./modules/logger')

/* Setup Sentry which logs backend errors */
const Sentry = require('@sentry/node')
Sentry.init({
  dsn: process.env.NODE_ENV === 'production' ? 'https://8ee2afb35b1b4faab2e45b860ec36c38@sentry.io/1548265' : null,
  environment: process.env.NODE_ENV
})

const app = new Koa()

/* Server side routing (mainly used for API) */
const router = new Router()

/* Connect to MongoDB database */
require('./db')

/* Body Parser Setup */
app.use(Body({ multipart: true }))

/* Adds useful ctx functions for API responses */
app.use(Respond())

/* Use compression for API responses to decrease size */
app.use(Compress())

app.keys = [process.env.SESSION_KEY]

/* Setup session */
const CONFIG = {
  key: 'koa:sess',
  maxAge: 86400000,
  // secure: true,
  renew: true
}
app.use(Session(CONFIG, app))

/* Initialize Passport for authentication */
app.use(passport.initialize())
app.use(passport.session())

/* Better security by default */
app.use(Helmet())

/* Log web server requests to console */
app.use(Logger())

/* Serve static files (CSS, JS, audio, etc.) */
app.use(Static('dist/'))

const Student = require('./api/students/students.model')
const Term = require('./api/terms/terms.model')
app.use(async (ctx, next) => {
  /* Every route passes through this middleware first! */

  // Make the environment available to routes so we know if we are in development or production
  ctx.state.env = process.env.NODE_ENV

  // Is this route for the API?
  ctx.state.isAPI = ctx.request.url.startsWith('/api')

  // If first request, get terms
  if (ctx.state.env === 'development' || !ctx.session.terms) {
    ctx.session.terms = await Term.find().exec()
  }

  // Calculate current term on each request in case it changes (very unlikely but possible)
  if (
    ctx.state.env === 'development' ||
    !ctx.session.currentTerm ||
    (ctx.session.currentTerm && moment().isAfter(ctx.session.currentTerm.endDate))
  ) {
    ctx.session.currentTerm = ctx.session.terms.find(t => t.isCurrent)
  }

  if (ctx.isAuthenticated()) {
    // The user is logged in

    Sentry.configureScope((scope) => {
      scope.setUser({ username: ctx.state.user.rcs_id })
    })

    ctx.state.discordClient = discordClient

    // Is the user on break?
    ctx.state.onBreak =
      !ctx.session.currentTerm ||
      !ctx.state.user.terms.includes(ctx.session.currentTerm.code)

    // Create Google auth if logged in and setup
    if (ctx.state.user && ctx.state.user.integrations.google.calendarID) {
      ctx.state.googleAuth = google.createAuth(ctx.state.user.integrations.google.tokens)
    }
  }

  // Try to complete the route
  try {
    await next()
  } catch (e) {
    // An uncaught error occurred at some point in the route!
    ctx.status = e.status || 500
    logger.error(e.stack)

    // Make sure request details for the error are sent to Sentry
    Sentry.withScope(scope => {
      scope.addEventProcessor(event => Sentry.Handlers.parseRequest(event, ctx.request))
      Sentry.captureException(e)
    })

    // Only send details of error if in development mode (to protect confidential info)
    ctx.send(
      ctx.status,
      ctx.state.env === 'development'
        ? e.message
        : 'An error occurred. Please try again later.'
    )
  }
})

/* All of the routes are set up in ./routes.js so we require and use them here */
require('./routes')(router)
app.use(router.routes())
app.use(router.allowedMethods())

/* Route all non api calls and non-static files (already handled above) to index.html so Vue takes over */
app.use(async ctx => {
  if (ctx.state.isAPI) {
    logger.error('API endpoint not found.')
    return ctx.notFound('API endpoint not found.')
  }
  await Send(ctx, 'dist/index.html')
})

module.exports = app
