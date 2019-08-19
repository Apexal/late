const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./sms.controller')

router.post('/actions/upcoming', Ctrl.findStudentFromSMSMiddleware, Ctrl.upcoming)
router.post('/actions/agenda', Ctrl.findStudentFromSMSMiddleware, Ctrl.agenda)

module.exports = router.routes()
