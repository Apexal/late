const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../../controllers/api/assignments');

router.get('/list', Ctrl.getAssignments);

router.get('/a/:assignmentID', Ctrl.getAssignment);

router.post('/create', Ctrl.createAssignment);
router.post('/a/:assignmentID/toggle', Ctrl.toggleAssignment);
router.post('/a/:assignmentID/edit', Ctrl.editAssignment);
router.post('/a/:assignmentID/remove', Ctrl.removeAssignment);

module.exports = router.routes();
