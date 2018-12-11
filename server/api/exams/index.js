const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./exams.controller');

router.get('/', Ctrl.getExams);
router.post('/', Ctrl.createExam);

module.exports = router.routes();
