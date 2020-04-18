const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./account.controller')

async function userResponse (ctx, next) {
  ctx.state.data = {}

  await next()
  await ctx.state.user.save()

  ctx.ok({
    updatedUser: ctx.state.user,
    ...ctx.state.data
  })
}

router.post('/sisimport', userResponse, Ctrl.setAllFromSIS)
router.post('/profile', userResponse, Ctrl.setProfile)
router.post('/terms', userResponse, Ctrl.setTerms)
router.post('/courseschedule', Ctrl.importCourseSchedule)
router.put('/courseschedule/:crn', Ctrl.addCourseByCRN)
router.post('/timepreference', Ctrl.setTimePreference)

module.exports = router.routes()
