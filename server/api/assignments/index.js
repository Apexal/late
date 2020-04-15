const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./assignments.controller')

router.get('/', Ctrl.getAssignments)
router.post('/', Ctrl.createAssignment)

router.get('/term/:termCode', Ctrl.getTermAssignments)

router.get(
  '/a/:assignmentID',
  Ctrl.getAssignmentMiddleware,
  Ctrl.getAssignment
)
router.get(
  '/a/:assignmentID/collaborators',
  Ctrl.getAssignmentMiddleware,
  Ctrl.getAssignmentCollaboratorInfo
)
router.post(
  '/a/:assignmentID/collaborators',
  Ctrl.getAssignmentMiddleware,
  Ctrl.setAssignmentCollaborators
)
router.patch(
  '/a/:assignmentID',
  Ctrl.getAssignmentMiddleware,
  Ctrl.updateAssignment
)
router.post(
  '/a/:assignmentID/toggle',
  Ctrl.getAssignmentMiddleware,
  Ctrl.toggleAssignment
)
router.delete(
  '/a/:assignmentID',
  Ctrl.getAssignmentMiddleware,
  Ctrl.deleteAssignment
)

/* Assignment Comments */
router.post(
  '/a/:assignmentID/comments',
  Ctrl.getAssignmentMiddleware,
  Ctrl.addComment
)
router.delete(
  '/a/:assignmentID/comments/:commentIndex',
  Ctrl.getAssignmentMiddleware,
  Ctrl.deleteComment
)

router.post('/generate', Ctrl.generateAssignments)

module.exports = router.routes()
