const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./quicklinks.controller');

router.get('/', Ctrl.getQuickLinks);
router.post('/', Ctrl.createQuickLink);
router.delete('/:quickLinkID', Ctrl.deleteQuickLink);

module.exports = router.routes();
