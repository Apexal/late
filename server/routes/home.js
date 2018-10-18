const cas = require('../auth.js');

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
  cas.bounce_redirect
);
router.get('logout', cas.logout);

module.exports = router.routes();
