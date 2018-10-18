/* Koa dependencies */
const Koa = require('koa');
const Router = require('koa-router');
const Logger = require('koa-logger');
const Static = require('koa-static');
const Helmet = require('koa-helmet');
const Session = require('koa-session');
const KoaBody = require('koa-body');
const Views = require('koa-views');
const CAS = require('./auth').cas;
const Respond = require('koa-respond');

const path = require('path');

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

app.use(KoaBody());

/* Better security by default */
app.use(Helmet());

/* Log web server requests */
app.use(Logger());

/* Serve static files (CSS, JS, audio, etc.) */
app.use(Static('client/public'));

/* Setup view system */
// TODO: UNCOMMENT WHEN TEMPLATING LANGUAGE IS CHOSEN
/*
/* Views setup using Pug */
app.use(
  Views(path.join(__dirname, '..', 'views'), {
    extension: 'pug'
  })
);

app.use(async (ctx, next) => {
  /* This is run before every single request is handled specifically. */
  ctx.state.basedir = path.join(__dirname, '..', 'views');

  ctx.state.loggedIn = !!ctx.session.cas_user;
  ctx.state.user = ctx.session.cas_user;

  console.log(ctx.session);

  await next();
});

/* Router setup */
require('./routes')(router);
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
