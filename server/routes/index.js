const cas = require('../auth').cas;

module.exports = router => {
  // router.user(path, router);
  router.use('/api', cas.bounce, require('./api'));
  router.use('/assignments', cas.bounce, require('./assignments'));
  router.use('/setup', cas.bounce, require('./setup'));
  router.use('/', require('./home'));
};
