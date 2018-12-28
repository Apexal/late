const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./exams.controller');

router.get('/', Ctrl.getExams);
router.post('/', Ctrl.createExam);

router.get('/e/:examID', Ctrl.getExam);
router.patch('/e/:examID', Ctrl.editExam);
router.delete('/e/:examID', Ctrl.removeExam);

module.exports = router.routes();
