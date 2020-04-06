const Todo = require('./todos.model')
const logger = require('../../modules/logger')

/**
 * Fetches a list of ALL todos for the current user, including todos completed over 30 days ago.
 *
 * **Response JSON**
 * - todos: list of user's Todo documents
 */
module.exports.getTodos = async function (ctx) {
  const todos = await Todo.find({
    _student: ctx.state.user._id
  }).populate('_blocks')

  return ctx.ok({ todos })
}

/**
 * Fetches a list of todos for the current user which haven't
 * been completed or were only completed within the last 30 days
 *
 * **Response JSON**
 * - todos: list of user's recent todos
 */
module.exports.getRecentTodos = async function (ctx) {
  const todos = await Todo.find({
    _student: ctx.state.user._id,
    completed: { $not: { $lt: new Date(new Date().getTime() - (30 * 24 * 60 * 60 * 1000)) } }
  }).populate('_blocks')
  return ctx.ok({ todos })
}

/**
 * Saves a new todo for the logged in user.
 *
 * **Request Body**
 * - text: the todo text string
 *
 * **Response JSON**
 * - createdTodo: the new Todo document
 */
module.exports.createTodo = async function (ctx) {
  const { text } = ctx.request.body
  const createdTodo = Todo({
    _student: ctx.state.user._id,
    text
  })
  try {
    await createdTodo.save()
  } catch (e) {
    logger.error(`Failed to save new todo for ${ctx.state.user.identifier}: ${e}`)
    return ctx.badRequest('There was an error adding the todo.')
  }

  logger.info(`Added todo for ${ctx.state.user.identifier}`)
  return ctx.created({ createdTodo })
}

/**
 * Updates the logged in user's todo with ID `todoID`.
 *
 * **Request Body**
 * - text: the todo text s tring
 * - completed: boolean whether or not the todo is completed
 *
 * **Response JSON**
 * - todo: the updated todo object
 */
module.exports.updateTodo = async function (ctx) {
  const { todoID } = ctx.params
  const { text, completed } = ctx.request.body
  const todo = await Todo.findOne({
    _id: todoID,
    _student: ctx.state.user._id
  }).populate('_blocks')

  if (!todo) {
    return ctx.notFound('No todo item could be found that matches this criteria.')
  }

  if (typeof text === 'string') {
    todo.text = text
  }
  if (typeof completed === 'number' || completed === null) {
    todo.completed = completed
  }

  try {
    await todo.save()
  } catch (e) {
    logger.error(`Failed to update a todo for ${ctx.state.user.identifier}: ${e}`)
    return ctx.badRequest('There was an error updating the todo.')
  }

  ctx.ok({ todo })
}

/**
 * Deletes the logged in user's todo with ID `todoID`.
 *
 * **Response JSON**
 * - deletedTodo: the deleted Todo document
 */
module.exports.deleteTodo = async function (ctx) {
  const { todoID } = ctx.params
  const deletedTodo = await Todo.findOne({
    _id: todoID,
    _student: ctx.state.user._id
  }).populate('_blocks')

  if (!deletedTodo) {
    return ctx.notFound('No todo item could be found that matches this criteria.')
  }

  await deletedTodo.remove()

  logger.info(`Deleted todo for ${ctx.state.user.identifier}`)
  ctx.ok({ deletedTodo })
}
