const Todo = require('./todos.model')
const logger = require('../../modules/logger')

/**
 * Fetches a list of todos for the current user.
 * @param {Koa context} ctx
 * @retuns A JSON list of todos
 */
async function getTodos (ctx) {
  const todos = await Todo.find({
    _student: ctx.state.user._id
  })
  return ctx.ok({ todos })
}

/**
 * Saves a new todo.
 * Request body:
 *  - text: the todo text
 * @param {Koa context} ctx
 */
async function createTodo (ctx) {
  const { text } = ctx.request.body
  const todo = Todo({
    _student: ctx.state.user._id,
    text
  })
  try {
    await todo.save()
  } catch (e) {
    logger.error(`Failed to save new todo for ${ctx.state.user.rcs_id}: ${e}`)
    return ctx.badRequest('There was an error adding the todo.')
  }

  logger.info(`Added todo for ${ctx.state.user.rcs_id}`)
  return ctx.created({ createdTodo: todo })
}

/**
 * Deletes a todo given its ID.
 * Request parameters:
 *  - todoID: the todo ID
 * @param {Koa context} ctx
 */
async function deleteTodo (ctx) {
  const { todoID } = ctx.params
  const deletedTodo = await Todo.findOne({
    _id: todoID,
    _student: ctx.state.user._id
  })

  deletedTodo.remove()

  logger.info(`Deleted todo for ${ctx.state.user.rcs_id}`)
  ctx.ok({ deletedTodo })
}

module.exports = {
  getTodos,
  createTodo,
  deleteTodo
}
