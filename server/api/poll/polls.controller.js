const Poll = require('./polls.model')

async function createPoll (ctx) {
  var poll = new Poll()

  poll.question = ctx.request.body.options.question
  poll.answers = ctx.request.body.options.answers
  poll.endTime = ctx.request.body.options.endTime

  poll.save()
  ctx.ok()
}

async function deletePoll (ctx) {

}

async function getPolls (ctx) {
  return ctx.request.body
}
