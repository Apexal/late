const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./account.controller')

const { loginToSIS } = require('../../modules/scraping')

/**
 * Middleware for routes that web scrape SIS and require
 * RIN and PIN in the request body.
 *
 * The credentials are used to login to SIS and then the cookie
 * jar from the login request is passed down the line.
 */
async function sisMiddleware (ctx, next) {
  const { rin, pin } = ctx.request.body

  if (!rin || !pin) {
    return ctx.badRequest('You must pass `rin` and `pin`!')
  }

  ctx.state.jar = await loginToSIS(rin, pin)

  await next()
}

/**
 * Middleware for routes that modify the current user and return the update user
 * and potentially other data.
 */
async function userMiddleware (ctx, next) {
  ctx.state.data = {}

  await next()
  await ctx.state.user.save()

  ctx.ok({
    updatedUser: ctx.state.user,
    ...ctx.state.data
  })
}

router.post('/sisimport', sisMiddleware, userMiddleware, Ctrl.setAllFromSIS)
router.post('/profile', userMiddleware, Ctrl.setProfile)
router.post('/terms', userMiddleware, Ctrl.setTerms)
router.post('/courseschedule', sisMiddleware, userMiddleware, Ctrl.importCourseSchedule)
router.put('/courseschedule/:crn', sisMiddleware, Ctrl.addCourseByCRN)
router.post('/timepreference', userMiddleware, Ctrl.setTimePreference)

module.exports = router.routes()
