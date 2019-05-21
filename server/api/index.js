const Router = require('koa-router');

const router = new Router();

const notOnBreak = (ctx, next) => {
  if (ctx.state.onBreak) return ctx.badRequest('You are on break!');
  return next();
};

router.use('/students', require('./students'));
router.use('/courses', notOnBreak, require('./courses'));
router.use('/assignments', notOnBreak, require('./assignments'));
router.use('/exams', notOnBreak, require('./exams'));
router.use('/account', notOnBreak, require('./account'));
router.use('/integrations', require('./integrations'));
router.use('/terms', require('./terms'));
router.use('/unavailabilities', notOnBreak, require('./unavailabilities'));
router.use('/blocks', notOnBreak, require('./blocks'));
router.use('/todos', require('./todos'));
router.use('/announcements', require('./announcements'));
router.use('/checklists', require('./checklists'));
router.use('/quicklinks', require('./quicklinks'));

router.use(
  '/google',
  async (ctx, next) => {
    if (!ctx.state.user.integrations.google.tokens) {
      return ctx.badRequest('Google account not authenticated!');
    }
    await next();
  },
  require('./google')
);

module.exports = router.routes();
