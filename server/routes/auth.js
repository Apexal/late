const auth = require('../modules/auth.js');
const cas = auth.cas;

const Router = require('koa-router');
const router = new Router();

// CAS Auth routes
router.get(
  '/login',
  async (ctx, next) => {
    // In case just /login without redirectTo in the query
    ctx.query.redirectTo = ctx.query.redirectTo || '/';
    await next();
  },
  cas.bounce,
  auth.loginStudent
);
router.get('/logout', cas.logout);

module.exports = router.routes();
