const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./blocks.controller');

router.post('/', Ctrl.addWorkBlock);
router.delete('/:blockID', Ctrl.removeWorkBlock);

module.exports = router.routes();
