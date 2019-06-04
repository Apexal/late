const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./checklists.controller');

router.get('/', Ctrl.getStudentChecklist);
router.put('/', Ctrl.createOrUpdateChecklist);
router.get('/:checklistID', Ctrl.getChecklist);
// router.delete('/:checklistID', Ctrl.removeChecklist);

module.exports = router.routes();
