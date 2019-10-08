const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./poll.controller')

const requireAdmin = function (ctx, next) {
  if (!ctx.state.user || !ctx.state.user.admin) return ctx.unauthorized('Must be logged in as an admin!')
  return next()
}

module.exports = router.routes()
