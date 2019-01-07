const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./assignments.controller');

router.get('/', Ctrl.getAssignments);
router.post('/', Ctrl.createAssignment);

router.get(
  '/a/:assignmentID',
  Ctrl.getAssignmentMiddleware,
  Ctrl.getAssignment
);
router.patch(
  '/a/:assignmentID',
  Ctrl.getAssignmentMiddleware,
  Ctrl.editAssignment
);
router.post(
  '/a/:assignmentID/toggle',
  Ctrl.getAssignmentMiddleware,
  Ctrl.toggleAssignment
);
router.delete(
  '/a/:assignmentID',
  Ctrl.getAssignmentMiddleware,
  Ctrl.removeAssignment
);

/* Assignment Comments */
router.post('/a/:assignmentID/comments', Ctrl.addComment);

module.exports = router.routes();
