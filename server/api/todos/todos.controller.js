const Todo = require('./todos.model')
const logger = require('../../modules/logger')

/**
 * Fetches a list of ALL todos for the current user, including todos completed over 30 days ago.
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
 * Fetches a list of todos for the current user which haven't
 * been completed or were only completed within the last 30 days
 * @param {Koa context} ctx
 * @retuns A JSON list of todos
 */
async function getRecentTodos (ctx) {
  const todos = await Todo.find({
    _student: ctx.state.user._id,
    completed: { $not: { $lt: new Date(new Date().getTime() - (30 * 24 * 60 * 60 * 1000)) } }
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
    logger.error(`Failed to save new todo for ${ctx.state.user.identifier}: ${e}`)
    return ctx.badRequest('There was an error adding the todo.')
  }

  logger.info(`Added todo for ${ctx.state.user.identifier}`)
  return ctx.created({ createdTodo: todo })
}

/**
 * Updates a todo given its ID.
 * Request body:
 *   - text: the todo text
 *   - completed: boolean whether or not the todo is completed
 * @param ctx {Koa context} ctx
 * @returns {Promise<void>} void
 */
async function updateTodo (ctx) {
  const { todoID } = ctx.params
  const { text, completed } = ctx.request.body
  const todo = await Todo.findOne({
    _id: todoID,
    _student: ctx.state.user._id
  })

  if (!todo) {
    return ctx.notFound('No todo item could be found that matches this criteria.')
  }

  if (typeof text === 'string') {
    todo.text = text
  }
  if (typeof completed === 'number' || completed === null) {
    todo.completed = completed
  }

  todo.save()

  ctx.ok({ todo })
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

  if (!deletedTodo) {
    return ctx.notFound('No todo item could be found that matches this criteria.')
  }

  deletedTodo.remove()

  logger.info(`Deleted todo for ${ctx.state.user.identifier}`)
  ctx.ok({ deletedTodo })
}

module.exports = {
  getTodos,
  getRecentTodos,
  createTodo,
  updateTodo,
  deleteTodo
}
