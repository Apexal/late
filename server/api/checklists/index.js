const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./checklists.controller');

router.get('/', Ctrl.getChecklists);
router.post('/', Ctrl.createChecklist);
router.get('/:checklistID', Ctrl.getChecklist);
router.patch('/:checklistID', Ctrl.updateChecklist);
// router.delete('/:checklistID', Ctrl.removeChecklist);

module.exports = router.routes();
