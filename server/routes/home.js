const auth = require('../auth.js');
const cas = auth.cas;

const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/home');

// Match specific routes to their controllers
router.get('/', Ctrl.index);
router.get('about', Ctrl.about);
router.get('honorable', cas.bounce, Ctrl.honorable);

module.exports = router.routes();
