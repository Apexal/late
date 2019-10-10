const Poll = require('./polls.model')

async function createPoll (ctx) {
  var poll = new Poll()

  poll.options.question = ctx.request.body.question
  poll.options.answers = ctx.request.body.answers
  poll.options.endTime = ctx.request.body.endTime

  poll.save()
  ctx.ok()
}

async function deletePoll (ctx) {

}

async function getPolls (ctx) {
  const polls = await Poll.find()
  console.log(polls)
  return ctx.ok({ polls })
}

module.exports = {
  createPoll,
  deletePoll,
  getPolls
}
