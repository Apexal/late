/**
 * This file consolidates all of the API routes with the authentication routes.
 * For the API routes, it ensures that there must be a logged in user for the majority of the endpoints.
 *
 * CAS authentication, Google authentication, and Discord authentication is also handled here.
 */


const exceptions = [
  '/students/loginas',
  '/students/counts',
  '/quicklinks',
  '/sms',
  '/checklists'
];


module.exports = router => {
  // router.use(path, router);
  router.use(
    '/api',
    async function (ctx, next) {
      if (
        exceptions.every(url => !ctx.request.url.startsWith('/api' + url)) &&
        !ctx.session.cas_user
      ) {
        return ctx.unauthorized('You must be logged in to use the API.');
      }
      await next();
    },
    require('./api')
  );

  router.use('/auth', require('./auth'));
};
