const Poll = require('./polls.model')

const { findOneOr404 } = require('../utils')

/**
 * Create a new poll.
 *
 * **Request Body**
 * - all poll properties
 *
 * **Response JSON**
 * - createdPoll: the created Poll document
 */
module.exports.createPoll = async function (ctx) {
  const poll = new Poll()

  poll.options.question = ctx.request.body.options.question
  poll.options.answers = ctx.request.body.options.answers
  poll.options.showResults = ctx.request.body.options.showResults

  poll.endDate = ctx.request.body.endDate

  poll.save()
  ctx.created({ createdPoll: poll })
}

/**
 * Get polls.
 *
 * **Request Query**
 * - getAll: 'true' or 'false' for whether to get all polls or future ones
 *
 * **Response JSON**
 * - polls: array of Poll documents
 */
module.exports.getPolls = async function (ctx) {
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

/**
 * Add a vote to a poll.
 *
 * **Request Body**
 * - id: the ObjectID of the poll
 * - value: the value of the answer to increment
 */
module.exports.addVote = async function (ctx) {
  const pollID = ctx.request.body.id
  const voteValue = ctx.request.body.value

  // get poll by _id field
  const updatedPoll = await findOneOr404(ctx, Poll.findOne({ _id: pollID }))

  // mark user as voted
  updatedPoll.voted.set(ctx.state.user.rcs_id, true)

  // increment vote count
  updatedPoll.options.answers[voteValue].votes++

  try {
    await updatedPoll.save()
  } catch (e) {
    return ctx.badRquest('Error, updating poll vote')
  }

  ctx.noContent()
}

// returns number of deleted polls
module.exports.deletePoll = async function (ctx) {
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
