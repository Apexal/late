const Poll = require('./polls.model')

async function createPoll (ctx) {
  var poll = new Poll()

  poll.options.question = ctx.request.body.question
  poll.options.answers = ctx.request.body.answers
  poll.options.endDate = ctx.request.body.endDate

  poll.save()
  ctx.ok()
}

async function getPolls (ctx) {
  const polls = await Poll.find()
  console.log(polls)
  return ctx.ok({ polls })
}

async function deletePoll (ctx) {

}

// returns number of deleted polls
async function deleteAllPolls (ctx) {
  const request = await Poll.deleteMany({})
  console.log(request)
  return ctx.ok(request.deletedCount)
}

module.exports = {
  createPoll,
  deletePoll,
  getPolls,
  deleteAllPolls
}
