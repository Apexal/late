const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./students.controller');

router.get('/', Ctrl.getStudents);
router.get('/counts', Ctrl.getStudentCounts);
router.get('/user', Ctrl.getUser);
router.get('/loginas', Ctrl.loginAs);
router.get('/:studentID', Ctrl.getStudent);


module.exports = router.routes();
