const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./announcements.controller');

router.get('/', Ctrl.getAnnouncements);
router.post('/', Ctrl.createAnnouncement);
router.delete('/:announcementID', Ctrl.deleteAnnouncement);

module.exports = router.routes();
