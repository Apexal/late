/**
 * This file consolidates all of the API routes with the authentication routes.
 * For the API routes, it ensures that there must be a logged in user for the majority of the endpoints.
 *
 * The API routes are located in ./api
 * The authentication routes are located in ./auth
 */

/**
 * These routes will allow unauthorized access as they do not depend on having the user logged in
 */
const exceptions = [
  '/students/loginas',
  '/students/counts',
  '/quicklinks',
  '/sms',
  '/checklists'
]

module.exports = router => {
  // The /api folder contains all API routes and is mounted at /api/ here
  router.use(
    '/api',
    async function (ctx, next) {
      // If the current route is NOT an exception, only allow access if the user is logged in!
      if (
        exceptions.every(url => !ctx.request.url.startsWith('/api' + url)) &&
        ctx.isUnauthenticated()
      ) {
        // Otherwise block and complain
        return ctx.unauthorized('You must be logged in to use the API.')
      }

      await next()
    },
    require('./api')
  )

  // Auth routes are mounted on /auth
  router.use('/auth', require('./auth'))
}
