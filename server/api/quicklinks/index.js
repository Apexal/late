const Router = require('koa-router')
const router = new Router()

const { adminMiddleware } = require('../utils')

const Ctrl = require('./quicklinks.controller')

router.get('/', Ctrl.getQuickLinks)
router.post('/', Ctrl.createQuickLink)
router.patch('/:quickLinkID', adminMiddleware, Ctrl.updateQuickLink)
router.delete('/:quickLinkID', adminMiddleware, Ctrl.deleteQuickLink)

module.exports = router.routes()
