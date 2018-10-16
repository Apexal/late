module.exports = router => {
  // router.user(path, router);
  router.use('/api', require('./api'));
  router.use('/', require('./home'));
};
