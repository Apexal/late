const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../../controllers/api/students');

router.get('/loginas', Ctrl.loginAs);

router.get('/user', Ctrl.getUser);

module.exports = router.routes();
