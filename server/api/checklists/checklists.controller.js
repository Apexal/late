const Checklist = require('./checklists.model')
const logger = require('../../modules/logger')

const { findOneOr404 } = require('../utils')
/**
 * Get all non-private checklists.
 *
 * @param {Koa context} ctx
 */
module.exports.getStudentChecklist = async function (ctx) {
  const checklist = await findOneOr404(ctx, Checklist.findOne({
    _student: ctx.state.user._id
  }))

  logger.info(`Sending checklist to ${ctx.state.user.identifier}`)

  ctx.ok({
    checklist
  })
}

/**
 * Get a public checklist by its ID
 *
 * @param {Koa context} ctx
 */
module.exports.getChecklist = async function (ctx) {
  const { checklistID } = ctx.params

  const checklist = await findOneOr404(ctx, Checklist.findOne({
    _id: checklistID,
    private: false
  }).populate('_student', 'rcs_id name graduationYear'))

  logger.info(`Sending checklist ${checklistID} to guest`)

  ctx.ok({
    checklist
  })
}

module.exports.createOrUpdateChecklist = async function (ctx) {
  // DO NOT USE findOr404 since we want to create if does not exist
  let checklist
  try {
    checklist = await Checklist.findOne({
      _student: ctx.state.user._id
    })
  } catch (e) {
    logger.error(`Failed to get checklist for ${ctx.state.user.identifier}: ${e}`)
    return ctx.badRequest('There was an error getting the checklist!')
  }

  const updates = {
    _student: ctx.state.user._id,
    categories: ctx.request.body.categories,
    private: ctx.request.body.private
  }

  if (!checklist) {
    checklist = new Checklist({
      ...updates,
      _student: ctx.state.user._id,
      private: true
    })
  } else {
    Object.assign(checklist, updates)
  }

  try {
    await checklist.save()
  } catch (e) {
    logger.error(
      `Failed to update checklist for ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.internalServerError('Failed to update the checklist!')
  }

  logger.info(`Saved checklist ${checklist._id} for ${ctx.state.user.identifier}`)

  return ctx.ok({
    updatedChecklist: checklist
  })
}

module.exports.removeChecklist = async function (ctx) {}
