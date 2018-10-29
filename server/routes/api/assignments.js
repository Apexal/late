const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../../controllers/api/assignments');

router.get('/list', Ctrl.listAllAssignments);

router.get('/:assignmentID', Ctrl.getAssignment);

router.get('/:assignmentID/remove', Ctrl.removeAssignment);

module.exports = router.routes();
