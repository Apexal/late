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
  router.use('/auth', require('./auth'));
};
