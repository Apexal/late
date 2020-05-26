const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./dormphotos.controller')

const { adminMiddleware } = require('../utils')

router.get('/', Ctrl.getDormPhotos)
// router.get('/:dormPhotoID', Ctrl.getDormPhoto)
router.post('/', Ctrl.uploadDormPhoto)
router.post('/:dormPhotoID/confirm', adminMiddleware, Ctrl.confirmDormPhoto)
router.delete('/:dormPhotoID', adminMiddleware, Ctrl.removeDormPhoto)

module.exports = router.routes()
