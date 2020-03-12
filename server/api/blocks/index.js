const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./blocks.controller')

// Assessment blocks
// router.post('/assessment/:assessmentType/:assessmentID', Ctrl.addAssessmentBlock)
// router.post('/course/:courseCRN', Ctrl.addCourseBlock)
// router.post('/todo/:todoID', Ctrl.addToDoBlock)

// Course blocks
router.post('/course/:courseID', Ctrl.addCourseBlock)
router.patch('/course/:courseID/:blockID', Ctrl.editCourseBlock)
router.delete('/course/:courseID/:blockID', Ctrl.deleteCourseBlock)

// Todo Blocks
router.post('/todo/:todoID', Ctrl.addTodoBlock)
router.patch('/todo/:todoID/:blockID', Ctrl.editTodoBlock)
router.delete('/todo/:todoID/:blockID', Ctrl.deleteTodoBlock)

// Assessment blocks
router.post('/assessment/:assessmentType/:assessmentID', Ctrl.addAssessmentBlock)
router.patch('/assessment/:assessmentType/:assessmentID/:blockID', Ctrl.editAssessmentBlock)
router.delete('/assessment/:assessmentType/:assessmentID/:blockID', Ctrl.deleteAssessmentBlock)

module.exports = router.routes()
