const Router = require('koa-router');
const router = new Router();

// Match specific routes to their controllers
router.use('/assignments', require('./assignments'));

module.exports = router.routes();
