const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./google.controller');

router.use(Ctrl.googleAuthMiddleware);
router.get('/calendars', Ctrl.listCalendars);

module.exports = router.routes();
