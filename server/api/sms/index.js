const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./sms.controller');

router.post('/', Ctrl.findStudentFromSMSMiddleware, Ctrl.receivedSMS);

module.exports = router.routes();
