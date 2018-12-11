const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./assignments.controller');

router.get('/list', Ctrl.getAssignments);
router.post('/create', Ctrl.createAssignment);

router.get('/a/:assignmentID', Ctrl.getAssignment);
router.post('/a/:assignmentID/toggle', Ctrl.toggleAssignment);
router.post('/a/:assignmentID/edit', Ctrl.editAssignment);
router.post('/a/:assignmentID/remove', Ctrl.removeAssignment);
router.post('/a/:assignmentID/comments/add', Ctrl.addComment);

module.exports = router.routes();
