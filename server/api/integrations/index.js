const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./integrations.controller');

router.post('/sms/submit', Ctrl.submitSMS);
router.post('/sms/verify', Ctrl.verifySMS);
router.delete('/sms', Ctrl.disableSMS);

router.get('/discord/startverify', Ctrl.startVerifyDiscord);
router.delete('/discord', Ctrl.disableDiscord);

router.post('/preferences', Ctrl.saveNotificationPreferences);

module.exports = router.routes();
