const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./unavailabilities.controller')

router.get('/', Ctrl.getUnavailabilities)
router.post('/', Ctrl.createUnavailability)
router.patch('/:unavailabilityID', Ctrl.updateUnavailability)
router.delete('/clear', Ctrl.clearUnavailabilities)
router.delete('/:unavailabilityID', Ctrl.removeUnavailability)
module.exports = router.routes()
