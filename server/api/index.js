const Router = require('koa-router')

const router = new Router()
const logger = require('../modules/logger')

const notOnBreak = (ctx, next) => {
  if (ctx.state.onBreak && !ctx.request.url.includes('/term/')) {
    logger.error(`${ctx.state.user.identifier} tried to access '${ctx.request.url}' on break`)
    return ctx.badRequest('You are on break!')
  }
  return next()
}

router.use('/students', require('./students'))
router.use('/courses', notOnBreak, require('./courses'))
router.use('/assignments', notOnBreak, require('./assignments'))
router.use('/exams', notOnBreak, require('./exams'))
router.use('/account', require('./account')) // removed notOnBreak temporarily
router.use('/integrations', require('./integrations'))
router.use('/terms', require('./terms'))
router.use('/unavailabilities', notOnBreak, require('./unavailabilities'))
router.use('/blocks', notOnBreak, require('./blocks'))
router.use('/todos', require('./todos'))
router.use('/announcements', require('./announcements'))
router.use('/checklists', require('./checklists'))
router.use('/quicklinks', require('./quicklinks'))
router.use('/dormphotos', require('./dormphotos'))
router.use('/sms', require('./sms'))
router.use('/polls', require('./polls'))

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

router.post('/tools/suggest', async ctx => {
  const { suggestion } = ctx.request.body

  if (!suggestion) {
    return ctx.badRequest('Must send suggestion.')
  }
  sgMail.send({
    to: 'matraf@rpi.edu',
    from: 'LATE <thefrankmatranga@gmail.com>',
    templateId: 'd-3ebbbf52793045be9df74f00bd2c6b7b',
    dynamic_template_data: {
      student: ctx.state.user ? ctx.state.user.rcs_id : 'anonymous',
      suggestion: ctx.request.body.suggestion
    }
  })
  ctx.ok({ message: 'Sent message!' })
})

router.use(
  '/google',
  async (ctx, next) => {
    if (!ctx.state.user.integrations.google.tokens) {
      return ctx.badRequest('Google account not authenticated!')
    }
    await next()
  },
  require('./google')
)

module.exports = router.routes()
