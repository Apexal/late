const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../../controllers/api/integrations');

router.post('/sms/submit', Ctrl.submitSMS);
router.post('/sms/verify', Ctrl.verifySMS);
router.post('/sms/preferences', Ctrl.updatePreferencesSMS);

module.exports = router.routes();
