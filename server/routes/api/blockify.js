const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../../controllers/api/blockify');

// make post when we actually save to database
router.get('/', Ctrl.makeBlocks);

module.exports = router.routes();
