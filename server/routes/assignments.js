const Router = require('koa-router');
const router = new Router();
const Ctrl = require('../controllers/assignments');

router.post('/a/:assignmentID/toggle', Ctrl.toggleAssignment);

router.get('/new', Ctrl.getNew);
router.post('/new', Ctrl.postNew);

router.get('/list', Ctrl.getList);

module.exports = router.routes();
