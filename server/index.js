/* Koa dependencies */
const Koa = require('koa');
const Router = require('koa-router');
const Logger = require('koa-logger');
const Static = require('koa-static');
const Helmet = require('koa-helmet');
const Session = require('koa-session');
const Body = require('koa-bodyparser');
const Respond = require('koa-respond');
const Send = require('koa-send');

const logger = require('./logger');
const path = require('path');
const moment = require('moment');

const app = new Koa();
const router = new Router();

const db = require('../db').models;

/* MongoDB setup */
app.context.db = db; // The db is now available on every request

/* Body Parser Setup */
app.use(Body());

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


/* Route all non api calls and non-static files (already handled above) to index.html so Vue takse over */
app.use(async (ctx, next) => {
  if (!ctx.request.url.startsWith('/api/')) await Send(ctx, 'dist/index.html');
  else await next();
});

/* Error handling */
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status == 404) ctx.throw(404, 'Page Not Found');
  } catch (err) {
    ctx.status = err.status || 500;
    logger.error(err);

    ctx.send(err.status, err);
  }
});

/* Router setup */
require('./routes')(router);
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
