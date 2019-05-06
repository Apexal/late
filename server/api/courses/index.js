const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./courses.controller');

router.get('/', Ctrl.getCourses);

module.exports = router.routes();
