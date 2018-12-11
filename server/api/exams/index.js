const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./exams.controller');

router.get('/', Ctrl.getExams);

module.exports = router.routes();
