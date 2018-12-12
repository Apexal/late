const { loginStudent, cas } = require('./modules/auth');

module.exports = router => {
  // router.use(path, router);

  router.use(
    '/api',
    async function (ctx, next) {
      if (
        !ctx.request.url.startsWith('/api/students/loginas') &&
        !ctx.session.cas_user
      ) {
        return ctx.unauthorized('You must be logged in to use the API.');
      }
      await next();
    },
    require('./api')
  );

  // CAS Auth routes
  router.get(
    '/auth/login',
    async (ctx, next) => {
      // In case just /login without redirectTo in the query
      ctx.query.redirectTo = ctx.query.redirectTo || '/';
      await next();
    },
    cas.bounce,
    loginStudent
  );
  router.get('/auth/logout', cas.logout);
};
