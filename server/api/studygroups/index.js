const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./studygroups.controller')

router.post('/', Ctrl.createStudyGroup)
router.get('/', Ctrl.getStudyGroups)

module.exports = router.routes()
