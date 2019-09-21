const Router = require('koa-router')
const router = new Router()

const Ctrl = require('./todos.controller')

router.get('/', Ctrl.getTodos)
router.post('/', Ctrl.createTodo)
router.post('/:todoID', Ctrl.updateTodo)
router.delete('/:todoID', Ctrl.deleteTodo)

module.exports = router.routes()
