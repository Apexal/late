/* Koa dependencies */
const Koa = require('koa');
const Router = require('koa-router');
const Logger = require('koa-logger');

const app = new Koa();
const router = new Router();

app.use(Logger());

app.use(async (ctx, next) => {
  /* This is run before every single request is handled specifically. */
  await next();
});

/* Router setup */
require('./routes')(router);
app.use(router.routes());
app.use(router.allowedMethods());

app.on('error', err => {
  log.error('server error', err);
});

module.exports = app;
