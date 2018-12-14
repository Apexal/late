const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./blocks.controller');

router.post('/', Ctrl.addWorkBlock);

module.exports = router.routes();
