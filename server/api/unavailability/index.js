const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./unavailability.controller');

router.get('/', Ctrl.getUnavailability);
router.post('/', Ctrl.createUnavailability);
router.delete('/:unavailabilityID', Ctrl.removeUnavailability);

module.exports = router.routes();
