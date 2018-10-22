const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/setup');

router.get('/', Ctrl.getSetupIndex);

router.get('/personal_info', Ctrl.getPersonalInfoSetup);
router.post('/personal_info', Ctrl.postPersonalInfoSetup);

router.get('/course_schedule', Ctrl.getCourseScheduleSetup);
router.post('/course_schedule', Ctrl.postCourseScheduleSetup);

module.exports = router.routes();
