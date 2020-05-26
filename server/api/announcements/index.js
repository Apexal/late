const Router = require('koa-router')
const router = new Router()

const { adminMiddleware } = require('../utils')

const Ctrl = require('./announcements.controller')

router.get('/', Ctrl.getAnnouncements)
router.post('/', adminMiddleware, Ctrl.createAnnouncement)
router.patch('/:announcementID', adminMiddleware, Ctrl.editAnnouncement)
router.delete('/:announcementID', adminMiddleware, Ctrl.deleteAnnouncement)

module.exports = router.routes()
