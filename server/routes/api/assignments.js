const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../../controllers/api/assignments');

router.get('/list', Ctrl.listAllAssignments);

module.exports = router.routes();
