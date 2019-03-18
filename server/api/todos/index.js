const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./todos.controller');

router.get('/', Ctrl.getTodosByName);
router.post('/', Ctrl.saveTodo);
router.delete('/:todoID', Ctrl.removeTodo);

module.exports = router.routes();
