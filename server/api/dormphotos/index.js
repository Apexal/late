const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./dormphotos.controller')

const requireAdmin = function (ctx, next) {
  if (!ctx.state.user || !ctx.state.user.admin) return ctx.unauthorized('Must be logged in as an admin!')
  return next()
}

router.get('/', Ctrl.getDormPhotos)
// router.get('/:dormPhotoID', Ctrl.getDormPhoto)
router.post('/', Ctrl.uploadDormPhoto)
router.post('/:dormPhotoID/confirm', requireAdmin, Ctrl.confirmDormPhoto)
router.delete('/:dormPhotoID', requireAdmin, Ctrl.removeDormPhoto)

module.exports = router.routes()
