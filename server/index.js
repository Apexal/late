/* Koa dependencies */
const Koa = require('koa');
const Router = require('koa-router');
const Logger = require('koa-logger');
const Static = require('koa-static');
const Helmet = require('koa-helmet');
const Session = require('koa-session');
const Body = require('koa-body');
const Respond = require('koa-respond');
const Send = require('koa-send');

const moment = require('moment');

// Start the Discord bot
require('./integrations/discord');

const logger = require('./modules/logger');

const app = new Koa();
const router = new Router();

// Connect to MongoDB
require('./db');

/* Body Parser Setup */
app.use(Body({ multipart: true }));

/* Adds useful ctx functions for API responses */
app.use(Respond());

app.keys = ['WE ARE GOING TO CHANGE THIS'];

/* Setup session */
const CONFIG = {
  key: 'koa:sess',
  maxAge: 86400000
};
app.use(Session(CONFIG, app));

/* Better security by default */
app.use(Helmet());

/* Log web server requests to console */
app.use(Logger());

/* Serve static files (CSS, JS, audio, etc.) */
app.use(Static('dist/'));

const Student = require('./api/students/students.model');
const Term = require('./api/terms/terms.model');
app.use(async (ctx, next) => {
  ctx.state.env = process.env.NODE_ENV;
  ctx.state.isAPI = ctx.request.url.startsWith('/api');

  if (ctx.session.cas_user) {
    ctx.state.user = await Student.findOne()
      .byUsername(ctx.session.cas_user.toLowerCase())
      .exec();

    // If first request, get terms
    /* if (!ctx.session.terms) */ ctx.session.terms = await Term.find().exec();

    // Calculate current term on each request in case it changes (very unlikely but possible)
    ctx.session.currentTerm = ctx.session.terms.find(t =>
      moment().isBetween(moment(t.start), moment(t.end))
    );
  }
  try {
    await next();
  } catch (e) {
    ctx.status = e.status || 500;
    logger.error(e);

    ctx.send(
      ctx.status,
      ctx.state.env === 'development'
        ? e.message
        : 'An error occurred. Please try again later.'
    );
  }
});

/* Router setup */
require('./routes')(router);
app.use(router.routes());
app.use(router.allowedMethods());

/* Route all non api calls and non-static files (already handled above) to index.html so Vue takes over */
app.use(async ctx => {
  if (ctx.state.isAPI) {
    logger.error('API endpoint not found.');
    return ctx.notFound('API endpoint not found.');
  }
  await Send(ctx, 'dist/index.html');
});

module.exports = app;
