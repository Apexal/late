const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./account.controller');

router.post('/sisimport', Ctrl.setAllFromSIS);
router.post('/profile', Ctrl.setProfile);
router.post('/terms', Ctrl.setTerms);
router.post('/courseschedule', Ctrl.importCourseSchedule);
router.put('/courseschedule/:crn', Ctrl.addCourseByCRN);
router.post('/timepreference', Ctrl.setTimePreference);

module.exports = router.routes();
