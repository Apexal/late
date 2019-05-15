const Router = require('koa-router');

const router = new Router();

router.use('/students', require('./students'));
router.use('/courses', require('./courses'));
router.use('/assignments', require('./assignments'));
router.use('/exams', require('./exams'));
router.use('/account', require('./account'));
router.use('/integrations', require('./integrations'));
router.use('/terms', require('./terms'));
router.use('/unavailabilities', require('./unavailabilities'));
router.use('/blocks', require('./blocks'));
router.use('/todos', require('./todos'));
router.use('/announcements', require('./announcements'));
router.use('/checklists', require('./checklists'));

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
