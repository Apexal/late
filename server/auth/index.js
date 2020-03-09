const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./auth.controller')
const passport = require('koa-passport')
const cas = require('../modules/cas')
const logger = require('../modules/logger')

// ------- CAS -------
router.get(
  '/login',
  passport.authenticate('cas', { failureRedirect: '/failed' }),
  async function (ctx) {
    if (ctx.state.user.accountLocked) {
      return ctx.redirect('/?waitlisted=1')
    }
    if (!ctx.state.user.setup.profile) {
      return ctx.redirect('/account')
    }

    ctx.redirect('/')
  }
)

router.get('/logout', function (ctx) {
  if (ctx.isAuthenticated()) {
    logger.info(`Logging out ${ctx.state.user.identifier}`)
    // return cas.logout(ctx, ctx.res)
    ctx.logout()
  }
  ctx.redirect('/')
})

// ------ GOOGLE ------
router.get('/google', Ctrl.startGoogleAuth)
router.get('/google/callback', Ctrl.googleAuth)

// ------ DISCORD ------
router.get('/discord', Ctrl.startDiscordAuth)
router.get('/discord/callback', Ctrl.discordAuth)

module.exports = router.routes()
