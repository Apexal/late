const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./auth.controller')

const cas = require('../modules/cas')

// ------- CAS -------
router.get(
  '/login',
  cas.bounce,
  Ctrl.loginStudent
)
router.get('/logout', cas.logout)

// ------ GOOGLE ------
router.get('/google', Ctrl.startGoogleAuth)
router.get('/google/callback', Ctrl.googleAuth)

// ------ DISCORD ------
router.get('/discord', Ctrl.startDiscordAuth)
router.get('/discord/callback', Ctrl.discordAuth)

module.exports = router.routes()
