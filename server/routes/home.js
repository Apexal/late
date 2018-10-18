const auth = require('../auth.js');
const cas = auth.cas;

const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/home');

// Match specific routes to their controllers
router.get('/', Ctrl.index);
router.get('about', Ctrl.about);
router.get('honorable', cas.bounce, Ctrl.honorable);

// CAS Auth routes
router.get(
  'login',
  async (ctx, next) => {
    // In case just /login without redirectTo in the query
    ctx.query.redirectTo = ctx.query.redirectTo || '/';
    await next();
  },
  cas.bounce,
  async (ctx, next) => {
    ctx.session.cas_user = ctx.session.cas_user.toLowerCase();
    await next();
  },
  auth.loginStudent
);
router.get('logout', cas.logout);

module.exports = router.routes();
