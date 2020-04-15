const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./courses.controller')

router.get('/', Ctrl.getCourses)
router.get('/term/:termCode', Ctrl.getTermCourses)
router.patch('/:courseID', Ctrl.updateCourse)
router.delete('/:courseID', Ctrl.removeCourse)

module.exports = router.routes()
