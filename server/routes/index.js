const cas = require('../auth.js');

module.exports = router => {
  // router.user(path, router);
  router.use('/', require('./home'));
};
