const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../../controllers/api/setup');

router.post('/personalinfo', Ctrl.setPersonalInfo);
router.post('/courseschedule', Ctrl.setCourseSchedule);
router.post('/workschedule', Ctrl.setWorkSchedule);

module.exports = router.routes();
