const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./assignments.controller');

router.get('/list', Ctrl.getAssignments);
router.post('/', Ctrl.createAssignment);

router.get('/a/:assignmentID', Ctrl.getAssignment);
router.patch('/a/:assignmentID', Ctrl.editAssignment);
router.delete('/a/:assignmentID', Ctrl.removeAssignment);
router.post('/a/:assignmentID/toggle', Ctrl.toggleAssignment);

/* Assignment Comments */
router.post('/a/:assignmentID/comments', Ctrl.addComment);

module.exports = router.routes();
