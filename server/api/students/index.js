const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./students.controller');

router.get('/', Ctrl.getStudents);
router.get('/user', Ctrl.getUser);
router.get('/loginas', Ctrl.loginAs);


module.exports = router.routes();
