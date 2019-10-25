const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./polls.controller')

router.post('/', Ctrl.createPoll)
router.get('/', Ctrl.getPolls)
router.delete('/', Ctrl.deletePoll)
router.patch('/', Ctrl.addVote)

module.exports = router.routes()
