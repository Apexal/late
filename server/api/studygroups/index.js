const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./studygroups.controller')

router.post('/', Ctrl.createStudyGroup)
router.get('/', Ctrl.getStudyGroups)

router.get('/:groupID', Ctrl.getStudyGroup)

module.exports = router.routes()
