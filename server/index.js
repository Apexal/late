/* Koa dependencies */
const Koa = require('koa');
const Router = require('koa-router');
const Logger = require('koa-logger');
const Static = require('koa-static');
const Helmet = require('koa-helmet');
const Session = require('koa-session');
const KoaBody = require('koa-bodyparser');
const Views = require('koa-views');
const Respond = require('koa-respond');

const logger = require('./logger');
const path = require('path');
const moment = require('moment');

const app = new Koa();
const router = new Router();

const db = require('../db').models;

/* MongoDB setup */
app.context.db = db; // The db is now available on every request

app.use(KoaBody());

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

/* Log web server requests */
app.use(Logger());

/* Serve static files (CSS, JS, audio, etc.) */
app.use(Static('client/public'));

/* Views setup using Pug */
app.use(
  Views(path.join(__dirname, '..', 'views'), {
    extension: 'pug'
  })
);

app.use(async (ctx, next) => {
  /* This is run before every single request is handled specifically. */
  ctx.state.basedir = path.join(__dirname, '..', 'views');
  ctx.state.moment = moment;
  ctx.state.env = process.env.NODE_ENV || 'production';

  // Create flash session object if does not exist yet (first request)
  if (ctx.session.flash === undefined) ctx.session.flash = {};

  // Inject flash function into request
  ctx.request.flash = (type, msg) => {
    ctx.session.flash[type] = msg;
  };

  if (ctx.state.env == 'development')
    ctx.request.flash(
      'warning',
      'This is the unstable development server of LATE. Things will break and crash.'
    );

  // Empty the flash but before that pass it to the state to use in views
  ctx.state.flash = ctx.session.flash;
  ctx.session.flash = {};

  // Allow views to know the url
  ctx.state.path = ctx.request.url;

  /* ctx.state is passed to the views, but can also of course be accessed in a route */
  ctx.state.loggedIn = !!ctx.session.cas_user;

  if (ctx.state.loggedIn) {
    ctx.state.username = ctx.session.cas_user.toLowerCase();
    ctx.state.user = await ctx.db.Student.findOne().byUsername(
      ctx.state.username
    );
  }

  await next();

  // Keep flash on redirect so it is not lost
  if (ctx.status === 302 && ctx.session && !ctx.session.flash)
    ctx.session.flash = ctx.state.flash;
});

/* Error handling */
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status == 404) ctx.throw(404, 'Page Not Found');
  } catch (err) {
    if (ctx.request.url.startsWith('/api/'))
      return ctx.notFound('API path not found.');

    ctx.status = err.status || 500;
    ctx.state.error = err;
    logger.error(err);

    await ctx.render('error');
  }
});

/* Router setup */
require('./routes')(router);
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
