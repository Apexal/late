const Course = require('./courses.model');
const logger = require('../../modules/logger');

/**
 * Fetches the current student's course list for the current term.
 * @param {Koa context} ctx
 * @retuns A JSON list of unavailability blocks
 */
async function getCourses (ctx) {
  const courses = await Course.find({
    _student: ctx.state.user._id,
    termCode: ctx.session.currentTerm.code
  }).sort('longname');

  logger.info(`Sending courses to ${ctx.state.user.rcs_id}`);

  return ctx.ok({ courses });
}

/**
 * Update a course.
 * Request body:
 *  - any properties to patch the block with (excluding _id)
 * @param {Koa context} ctx
 */
async function updateCourse (ctx) {
  const { courseID } = ctx.params;

  let course;
  try {
    course = await Course.findOne({
      _id: courseID,
      _student: ctx.state.user._id
    });

    // const forbiddenProperties = ['_id', '_student', 'crn', 'originalTitle'];
    // if (forbiddenProperties.some(prop => ctx.request.body[prop] !== course[prop])) {
    //   throw new Error('You cannot change the id, owner, crn, or original title of a course!');
    // }

    course.set(ctx.request.body);

    await course.save();
  } catch (e) {
    logger.error(
      `Failed to update course for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('There was an error updating the course.');
  }

  logger.info(`Updated course for ${ctx.state.user.rcs_id}`);
  return ctx.created({ updatedCourse: course });
}

module.exports = {
  getCourses,
  updateCourse
};
