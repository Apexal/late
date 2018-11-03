const Router = require('koa-router');
const router = new Router();

// Match specific routes to their controllers
router.use('/assignments', require('./assignments'));
router.use('/students', require('./students'));
router.use('/setup', require('./setup'));

module.exports = router.routes();
