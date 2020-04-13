const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./auth.controller')
const passport = require('koa-passport')
const cas = require('../modules/cas')
const logger = require('../modules/logger')

// ------- CAS -------
router.get(
  '/login',
  function (ctx, next) {
    return passport.authenticate('cas', function (err, user, info, status) {
      if (err) {
        return ctx.redirect('/?waitlisted=1')
      }
      ctx.login(user, function (loginErr) {
        if (!ctx.state.user.setup.profile) {
          return ctx.redirect('/account')
        }
        ctx.redirect('/')
      })
    })(ctx, next)
  }
)

router.get('/logout', function (ctx) {
  if (ctx.isAuthenticated()) {
    logger.info(`Logging out ${ctx.state.user.identifier}`)
    // return cas.logout(ctx, ctx.res)
    ctx.logout()
  }
  ctx.redirect('https://cas-auth.rpi.edu/cas/logout?service=' + process.env.BASE_URL)
})

// ------ GOOGLE ------
router.get('/google', Ctrl.startGoogleAuth)
router.get('/google/callback', Ctrl.googleAuth)

// ------ DISCORD ------
router.get('/discord', Ctrl.startDiscordAuth)
router.get('/discord/callback', Ctrl.discordAuth)

module.exports = router.routes()
