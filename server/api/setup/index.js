const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./setup.controller');

router.post('/personalinfo', Ctrl.setPersonalInfo);
router.post('/courseschedule', Ctrl.setCourseSchedule);
router.post('/courses', Ctrl.setCourses);
router.post('/unavailability', Ctrl.setUnavailability);

module.exports = router.routes();
