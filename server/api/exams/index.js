const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./exams.controller');

router.get('/', Ctrl.getExams);
router.post('/', Ctrl.createExam);

router.get('/e/:examID', Ctrl.getExamMiddleware, Ctrl.getExam);
router.patch('/e/:examID', Ctrl.getExamMiddleware, Ctrl.editExam);
router.delete('/e/:examID', Ctrl.getExamMiddleware, Ctrl.removeExam);

module.exports = router.routes();
