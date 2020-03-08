const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./polls.controller')

router.put('/', Ctrl.createPoll)
router.get('/', Ctrl.getPolls)
router.delete('/', Ctrl.deletePoll)
router.post('/', Ctrl.addVote)

module.exports = router.routes()
