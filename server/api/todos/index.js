const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./todos.controller');

router.get('/', Ctrl.getTodos);
router.post('/', Ctrl.createTodo);
router.delete('/:todoID', Ctrl.removeTodo);

module.exports = router.routes();