const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./integrations.controller')

router.get('/academiccalendar', Ctrl.getAcademicCalendarEvents)
router.post('/sms/submit', Ctrl.submitSMS)
router.post('/sms/verify', Ctrl.verifySMS)
router.delete('/sms', Ctrl.disableSMS)
router.post('/githubissue', Ctrl.submitGitHubIssue)
router.get('/changelog', Ctrl.getChangelog)

router.post('/preferences', Ctrl.saveNotificationPreferences)

module.exports = router.routes()
