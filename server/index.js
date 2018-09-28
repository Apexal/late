/* Koa dependencies */
const Koa = require('koa');
const Router = require('koa-router');
const Logger = require('koa-logger');
const Static = require('koa-static');
const Helmet = require('koa-helmet');
const Session = require('koa-session');
const KoaBody = require('koa-body');
const Views = require('koa-views');

const app = new Koa();
const router = new Router();

app.use(KoaBody());

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

/* Setup view system */
// TODO: UNCOMMENT WHEN TEMPLATING LANGUAGE IS CHOSEN
/*
app.use(
  Views(__dirname + '/views', {
    map: {
      html: 'underscore'
    }
  })
);
*/

app.use(async (ctx, next) => {
  /* This is run before every single request is handled specifically. */
  await next();
});

/* Router setup */
require('./routes')(router);
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
