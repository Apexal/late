const Router = require('koa-router')
const router = new Router()

const { adminMiddleware } = require('../utils')

const Ctrl = require('./students.controller')

router.get('/', adminMiddleware, Ctrl.getStudents)
router.get('/log', adminMiddleware, Ctrl.getLog)
router.get('/counts', Ctrl.getStudentCounts)
router.get('/user', Ctrl.getUser)
router.patch('/user', Ctrl.editUser)
router.get('/loginas', Ctrl.loginAs)
router.get('/:studentID', adminMiddleware, Ctrl.getStudent)
router.patch('/:studentID', adminMiddleware, Ctrl.editStudent)
router.delete('/:studentID', adminMiddleware, Ctrl.deleteStudent)

module.exports = router.routes()
