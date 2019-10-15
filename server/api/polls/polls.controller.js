const Poll = require('./polls.model')

async function createPoll (ctx) {
  var poll = new Poll()

  poll.options.question = ctx.request.body.question
  poll.options.answers = ctx.request.body.answers
  poll.options.endDate = ctx.request.body.endDate
  poll.options.showResults = ctx.request.body.showResults
  poll.voted.set('lanea3', false)

  poll.save()
  ctx.ok()
}

async function getPolls (ctx) {
  const polls = (await Poll.find()).map(function (p) {
    p.options.showResults = p.voted.get(ctx.state.user.rcs_id)
    return p.options
  })
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
