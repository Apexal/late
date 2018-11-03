const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../../controllers/api/setup');

router.post('/personalinfo', Ctrl.setPersonalInfo);

module.exports = router.routes();
