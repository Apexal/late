const Poll = require('./polls.model')

async function createPoll (ctx) {
  var poll = new Poll()

  poll.options.question = ctx.request.body.question
  poll.options.answers = ctx.request.body.answers
  poll.options.endDate = ctx.request.body.endDate
  poll.options.showResults = ctx.request.body.showResults

  poll.save()
  ctx.ok()
}

async function getPolls (ctx) {
  const polls = (await Poll.find()).map(function (p) {
    const hasVoted = p.voted.get(ctx.state.user.rcs_id)
    p.options.showResults = hasVoted !== undefined ? hasVoted : false
    p.options.UID = p._id
    return p.options
  })
  return ctx.ok({ polls })
}

async function addVote (ctx) {
  const UID = ctx.request.body.id
  const voteValue = ctx.request.body.value

  // get poll by _id field
  const updatedPoll = (await Poll.find({ _id: UID }))[0]

  // mark user as voted
  updatedPoll.voted.set(ctx.state.user.rcs_id, true)

  // increment vote count
  updatedPoll.options.answers[voteValue].votes++

  try {
    await updatedPoll.save()
  } catch (e) {
    return ctx.badRquest('Error, updating poll voted')
  }

  ctx.ok()
}

// returns number of deleted polls
async function deleteAllPolls (ctx) {
  const request = await Poll.deleteMany({})
  return ctx.ok(request.deletedCount)
}

module.exports = {
  createPoll,
  getPolls,
  deleteAllPolls,
  addVote
}
