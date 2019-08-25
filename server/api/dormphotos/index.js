const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./dormphotos.controller')

router.get('/', Ctrl.getDormPhotos)
// router.get('/:dormphotoID', Ctrl.getDormPhoto)
router.post('/', Ctrl.uploadDormPhoto)
// router.delete('/', Ctrl.removeDormPhoto)

module.exports = router.routes()
