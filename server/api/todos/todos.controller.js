const Todo = require('./todos.model');
const logger = require('../../modules/logger');

/**
 * Fetches a list of todos for the given user.
 * @param {Koa context} ctx
 * @retuns A JSON list of todos
 */
async function getTodosByName (ctx) {
  const user = ctx.state.user;
  const todos = await Todo.find()
    .byUsername(user);
  return ctx.ok(todos);
}

/**
 * Saves the given todo.
 * Request parameters:
 *  - text: the todo text
 * @param {Koa context} ctx
 */
async function saveTodo (ctx) {
  const { text, addedAt } = ctx.request.body;
  const todo = Todo({
    _student: ctx.state.user._id,
    text,
    addedAt
  });
  try {
    await todo.save();
  } catch (e) {
    logger.error(`Failed to save new todo for ${ctx.state.user.rcs_id}: ${e}`);
    return ctx.badRequest('There was an error scheduling todo.');
  }
  
  logger.info(`Added todo for ${ctx.state.user.rcs_id}`);
  return ctx.created({ createdTodo: todo });
}

/**
 * Removes the given todo.
 * Request parameters:
 *  - id: the todo ID
 * @param {Koa context} ctx
 */
async function removeTodo (ctx) {
  // TODO: validate that this is this student's todo.
  const { id } = ctx.request.body;
  await Todo.findById(id).deleteOne().exec();
  ctx.status = 204; // no content
}

module.exports = {
  getTodosByName,
  saveTodo,
  removeTodo
};
