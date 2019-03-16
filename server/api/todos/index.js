const Router = require('koa-router');
const router = new Router();

const Ctrl = require('./todos.controller');

router.get('/', Ctrl.getTodosByName);
router.post('/save', Ctrl.saveTodo);
router.post('/remove', Ctrl.removeTodo);

module.exports = router.routes();
