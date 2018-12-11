const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./students.controller');

router.get('/loginas', Ctrl.loginAs);

router.get('/user', Ctrl.getUser);

module.exports = router.routes();
