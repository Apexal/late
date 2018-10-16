module.exports = router => {
  // router.user(path, router);
  router.use('/api', require('./api'));
  router.use('/assignments', require('./assignments'));
  router.use('/', require('./home'));
};
