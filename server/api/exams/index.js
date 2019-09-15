const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./exams.controller')

router.get('/', Ctrl.getExams)
router.post('/', Ctrl.createExam)

router.get('/term/:termCode', Ctrl.getTermExams)
router.get('/e/:examID', Ctrl.getExamMiddleware, Ctrl.getExam)
router.patch('/e/:examID', Ctrl.getExamMiddleware, Ctrl.editExam)
router.delete('/e/:examID', Ctrl.getExamMiddleware, Ctrl.deleteExam)

/* Exam Comments */
router.post('/e/:examID/comments', Ctrl.getExamMiddleware, Ctrl.addComment)
router.delete(
  '/e/:examID/comments/:commentIndex',
  Ctrl.getExamMiddleware,
  Ctrl.deleteComment
)

module.exports = router.routes()
