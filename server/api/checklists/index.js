const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./checklists.controller')

const requireLogin = function (ctx, next) {
  if (!ctx.state.user) return ctx.unauthorized('Must be logged in!')
  return next()
}

router.get('/', requireLogin, Ctrl.getStudentChecklist)
router.put('/', requireLogin, Ctrl.createOrUpdateChecklist)
router.get('/:checklistID', Ctrl.getChecklist)
// router.delete('/:checklistID', Ctrl.removeChecklist);

module.exports = router.routes()
