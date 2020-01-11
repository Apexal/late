const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./terms.controller')

router.get('/', Ctrl.getTerms)
router.patch('/:termID', Ctrl.updateTerm)
router.post('/', Ctrl.createTerm)

module.exports = router.routes()
