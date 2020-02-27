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

// Start the Discord bot
const discordClient = require('./integrations/discord').client

const logger = require('./modules/logger')

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

app.use(Compress())

app.keys = [process.env.SESSION_KEY]

/* Setup session */
const CONFIG = {
  key: 'koa:sess',
  maxAge: 86400000,
  renew: true
}
app.use(Session(CONFIG, app))

/* Better security by default */
app.use(Helmet())

/* Log web server requests to console */
app.use(Logger())

/* Serve static files (CSS, JS, audio, etc.) */
app.use(Static('dist/'))

const Student = require('./api/students/students.model')
const Term = require('./api/terms/terms.model')
app.use(async (ctx, next) => {
  ctx.state.env = process.env.NODE_ENV
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

  if (ctx.session.cas_user) {
    // Find the logged in user to make it available in all routes
    ctx.state.user = await Student.findOne()
      .byUsername(ctx.session.cas_user.toLowerCase())
      .exec()

    Sentry.configureScope((scope) => {
      scope.setUser({ username: ctx.state.user ? ctx.state.user.rcs_id : ctx.session.cas_user })
    })

    ctx.state.discordClient = discordClient

    if (ctx.state.user) {
      ctx.state.onBreak =
        !ctx.session.currentTerm ||
        !ctx.state.user.terms.includes(ctx.session.currentTerm.code)

      // Create Google auth if logged in and setup
      if (ctx.state.user && ctx.state.user.integrations.google.calendarID) {
        const auth = google.createConnection()
        auth.setCredentials(ctx.state.user.integrations.google.tokens)
        ctx.state.googleAuth = auth
      }
    } else {
      logger.error('User is NULL: ' + ctx.session.cas_user)
    }
  }
  try {
    await next()
  } catch (e) {
    ctx.status = e.status || 500
    logger.error(e)

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

/* Router setup */
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
