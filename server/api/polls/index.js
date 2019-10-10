const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./polls.controller')

router.post('/', Ctrl.createPoll)
router.get('/', Ctrl.getPolls)
router.delete('/', Ctrl.deleteAllPolls)

module.exports = router.routes()
