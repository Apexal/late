const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./students.controller')

router.get('/', Ctrl.getStudents)
router.get('/log', Ctrl.getLog)
router.get('/counts', Ctrl.getStudentCounts)
router.get('/user', Ctrl.getUser)
router.patch('/user', Ctrl.editUser)
router.get('/loginas', Ctrl.loginAs)
router.get('/:studentID', Ctrl.getStudent)
router.patch('/:studentID', Ctrl.editStudent)
router.delete('/:studentID', Ctrl.deleteStudent)

module.exports = router.routes()
