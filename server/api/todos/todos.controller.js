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
    .byUsername(user.rcs_id)
    .exec();
  return ctx.ok(todos.map(todo => todo.toJSON()));
}

/**
 * Saves the given todo.
 * Request parameters:
 *  - text: the todo text
 * @param {Koa context} ctx
 */
async function saveTodo (ctx) {
  const { text } = ctx.request.body;
  const todo = new Todo({
    _student: ctx.state.user._id,
    text
  });
  try {
    await todo.save();
  } catch (e) {
    logger.error(`Failed to save new todo for ${ctx.state.user.rcs_id}: ${e}`);
    return ctx.badRequest('There was an error scheduling todo.');
  }
}
