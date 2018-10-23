const cas = require('../auth').cas;

module.exports = router => {
  // router.user(path, router);
  router.use('/api', require('./api'));
  router.use('/setup', cas.bounce, require('./setup'));
  router.use('/', require('./home'));
};
