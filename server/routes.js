const { loginStudent, cas } = require('./modules/auth');

const google = require('./modules/google');

module.exports = router => {
  // router.use(path, router);

  router.use(
    '/api',
    async function (ctx, next) {
      if (
        !ctx.request.url.startsWith('/api/students/loginas') &&
        !ctx.request.url.startsWith('/api/students/counts') &&
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

  router.get('/auth/google', ctx => {
    const googleAuth = google.createConnection();
    ctx.redirect(google.createUrl(googleAuth));
  });

  router.get('/google/auth/callback', async ctx => {
    const googleAuth = google.createConnection();

    const { code } = ctx.query;
    const { tokens } = await googleAuth.getToken(code);

    ctx.state.user.integrations.google.accessTokens = tokens;
    ctx.state.user.setup.google = true;

    await ctx.state.user.save();

    ctx.redirect('/profile/setup/google');
  });
};
