const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../../controllers/api/integrations');

router.post('/sms/submit', Ctrl.submitSMS);
router.post('/sms/verify', Ctrl.verifySMS);
router.post('/sms/preferences', Ctrl.updatePreferencesSMS);

router.get('/discord/startverify', Ctrl.startVerifyDiscord);
router.post('/discord/preferences', Ctrl.updatePreferencesDiscord);

router.post('/email/preferences', Ctrl.updatePreferencesEmail);

module.exports = router.routes();
