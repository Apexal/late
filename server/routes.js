/**
 * This file consolidates all of the API routes with the authentication routes.
 * For the API routes, it ensures that there must be a logged in user for the majority of the endpoints.
 *
 * The API routes are located in ./api
 * The authentication routes are located in ./auth
 */

const exceptions = [
  '/students/loginas',
  '/students/counts',
  '/quicklinks',
  '/dormphotos',
  '/sms',
  '/checklists',
  '/dev_thing'
]

const dir = require('./modules/directory')

module.exports = router => {
  // router.use(path, router);

  // THIS IS TEMPORARY
  router.get('/dev_thing', async (ctx) => {
    const result = await dir.getNameAndMajor('smitha24')
    console.log(result)
    ctx.body = 'Hello Frank'
  })

  router.use(
    '/api',
    async function (ctx, next) {
      if (
        exceptions.every(url => !ctx.request.url.startsWith('/api' + url)) &&
        !ctx.session.cas_user
      ) {
        return ctx.unauthorized('You must be logged in to use the API.')
      }
      await next()
    },
    require('./api')
  )

  router.use('/auth', require('./auth'))
}
