const cas = require('../auth').cas;

module.exports = router => {
  // router.user(path, router);
  router.use(
    '/api',
    async function(ctx, next) {
      if (!ctx.state.loggedIn)
        return ctx.unauthorized('You must be logged in to use the API.');
      await next();
    },
    require('./api')
  );
  router.use('/assignments', cas.bounce, require('./assignments'));
  router.use('/setup', cas.bounce, require('./setup'));
  router.use('/', require('./home'));
};
