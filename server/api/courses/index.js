const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./courses.controller');

router.get('/', Ctrl.getCourses);
router.post('/:courseID', Ctrl.updateCourse);

module.exports = router.routes();
