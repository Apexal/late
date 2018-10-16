const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/api');

// Match specific routes to their controllers
router.get('/', Ctrl.index);

module.exports = router.routes();
