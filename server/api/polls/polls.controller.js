const Poll = require('./polls.model')

async function createPoll (ctx) {
  var poll = new Poll()

  poll.options.question = ctx.request.body.options.question
  poll.options.answers = ctx.request.body.options.answers
  poll.options.showResults = ctx.request.body.options.showResults

  poll.endDate = ctx.request.body.endDate

  poll.save()
  ctx.ok()
}

async function getPolls (ctx) {
  // get polls if endDate has not passed
  // or get all polls if getAll flag is passed

  const searchObj = {}
  if (ctx.query.getAll === 'false') {
    searchObj.endDate = { $gt: new Date() }
  } else {
    searchObj.endDate = { $lte: new Date() }
  }

  const polls = (await Poll.find(searchObj)).map(function (p) {
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
    return ctx.badRquest('Error, updating poll vote')
  }

  ctx.ok()
}

// returns number of deleted polls
async function deletePoll (ctx) {
  const UID = ctx.request.query.UID
  let request
  if (UID) {
    request = await Poll.deleteOne({ _id: UID })
  } else {
    // deletes polls that have expired
    request = await Poll.deleteMany({ endDate: { $lte: new Date() } })
  }

  return ctx.ok(request.deletedCount)
}

module.exports = {
  createPoll,
  getPolls,
  deletePoll,
  addVote
}
