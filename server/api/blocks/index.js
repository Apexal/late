const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./blocks.controller')

router.post('/:assessmentType/:assessmentID', Ctrl.addWorkBlock)
router.patch('/:assessmentType/:assessmentID/:blockID', Ctrl.editWorkBlock)
router.delete('/:assessmentType/:assessmentID/:blockID', Ctrl.deleteWorkBlock)

module.exports = router.routes()
