const Router = require('koa-router')
const router = new Router()

const { adminMiddleware } = require('../utils')

const Ctrl = require('./terms.controller')

router.get('/', Ctrl.getTerms)
router.patch('/:termID', adminMiddleware, Ctrl.updateTerm)
router.post('/', adminMiddleware, Ctrl.createTerm)

module.exports = router.routes()
