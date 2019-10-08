const Poll = require('./poll.model')

async function createPoll (ctx) {
  var poll = new Poll()

  poll.id = new Date().valueOf()
  poll.question = ctx.request.body.question
  poll.answers = ctx.request.body.answers

  poll.save()
  ctx.ok()
}

async function deletePoll (ctx) {

}

async function getPolls (ctx) {

}
