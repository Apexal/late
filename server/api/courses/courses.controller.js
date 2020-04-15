const Course = require('./courses.model')
const logger = require('../../modules/logger')

/**
 * Fetches the current student's course list for the current term.
 * @param {Koa context} ctx
 * @retuns A JSON list of unavailability blocks
 */
async function getCourses (ctx) {
  const courses = await Course.find({
    _student: ctx.state.user._id,
    termCode: ctx.session.currentTerm.code
  }).sort('-credits title').populate('_blocks')

  return ctx.ok({ courses })
}

async function getTermCourses (ctx) {
  const termCode = ctx.params.termCode
  const courses = await Course.find({
    _student: ctx.state.user._id,
    termCode
  }).sort('-credits title').populate('_blocks')

  logger.info(`Sending term ${termCode} courses to ${ctx.state.user.identifier}`)

  return ctx.ok({ courses })
}

/**
 * Update a course.
 * Request body:
 *  - any properties to patch the block with (excluding _id)
 * @param {Koa context} ctx
 */
async function updateCourse (ctx) {
  const { courseID } = ctx.params

  let course
  try {
    course = await Course.findOne({
      _id: courseID,
      _student: ctx.state.user._id
    }).populate('_blocks')

    if (!course) {
      return ctx.notFound('A course that matches this criteria could not be found.')
    }

    const forbiddenProperties = ['_id', '_student', 'crn', 'originalTitle']
    forbiddenProperties.forEach(prop => delete ctx.request.body[prop])

    course.set(ctx.request.body)

    await course.save()
  } catch (e) {
    logger.error(`Failed to update course for ${ctx.state.user.identifier}: ${e}`)
    return ctx.badRequest('There was an error updating the course.')
  }

  logger.info(`Updated course for ${ctx.state.user.identifier}`)
  return ctx.created({ updatedCourse: course })
}

/**
 * Given a course ID, remove the course from the database.
 * Of course. make sure it belongs to the logged in student.
 *
 * @param {Koa context} ctx
 * @returns {Object} The removed course
 */
async function removeCourse (ctx) {
  const { courseID } = ctx.params

  let course
  try {
    course = await Course.findOne({
      _id: courseID,
      _student: ctx.state.user._id
    }).populate('_blocks')
  } catch (e) {
    logger.error(`Failed to remove course ${courseID} for ${ctx.state.user.identifier}: ${e}`)
    return ctx.badRequest('There was an error getting the course.')
  }

  if (!course) return ctx.notFound('Couldn\'t find the course to delete!')

  await course.remove()
  logger.info(`Removed course ${course.originalTitle} for student ${ctx.state.user.identifier}`)
  return ctx.ok({ removedCourse: course })
}

module.exports = {
  getCourses,
  getTermCourses,
  updateCourse,
  removeCourse
}
