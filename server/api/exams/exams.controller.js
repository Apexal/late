const moment = require('moment');
const logger = require('../../modules/logger');

const Exam = require('./exams.model');

async function getExamMiddleware (ctx, next) {
  const examID = ctx.params.examID;

  let exam;
  try {
    exam = await Exam.findOne({
      _id: examID,
      _student: ctx.state.user._id
    }).populate('_blocks');
  } catch (e) {
    logger.error(
      `Error getting exam ${examID} for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.internalServerError('Failed to get exam.');
  }

  if (!exam) {
    logger.error(
      `Failed to find exam with ID ${examID} for ${ctx.state.user.rcs_id}.`
    );
    return ctx.notFound('Could not find exam.');
  }

  ctx.state.exam = exam;

  await next();
}

/**
 * Returns a list of all exams with optional filters.
 * start and end are optional URL query options in YYYY-MM-DD format.
 *
 * GET /exams
 * @param {Koa context} ctx
 */
async function getExams (ctx) {
  let exams;
  let { start, end } = ctx.query;
  try {
    exams = await ctx.state.user.getExams(start, end);
  } catch (e) {
    logger.error(`Failed to send exams to ${ctx.state.user.rcs_id}: ${e}`);
    return ctx.internalServerError('There was an error loading your exams.');
  }

  logger.info(`Sending exams to ${ctx.state.user.rcs_id}`);

  ctx.ok({
    exams
  });
}

/**
 * Get an exam by its ID.
 *
 * @param {Koa context} ctx
 */
async function getExam (ctx) {
  const examID = ctx.params.examID;

  logger.info(`Sending exam ${examID} to ${ctx.state.user.rcs_id}`);

  ctx.ok({
    exam: ctx.state.exam
  });
}

/**
 * Add a new exam.
 *
 * @param {Koa context} ctx
 */
async function createExam (ctx) {
  const body = ctx.request.body;
  const date = moment(body.date);

  // Limit to this semester
  if (
    !moment(date).isBetween(
      ctx.session.currentTerm.start,
      ctx.session.currentTerm.end
    )
  ) {
    logger.error(
      `${ctx.state.user.rcs_id} tried to add exam outside of current semester.`
    );
    return ctx.badRequest('You cannot add an exam outisde of this semester.');
  }

  const newExam = new Exam({
    _student: ctx.state.user._id,
    title: body.title,
    description: body.description,
    date: date.toDate(),
    courseCRN: body.courseCRN,
    priority: body.priority,
    timeEstimate: body.timeEstimate,
    timeRemaining: body.timeEstimate,
    comments: []
  });

  try {
    await newExam.save();
  } catch (e) {
    logger.error(`Failed to add exam for ${ctx.state.user.rcs_id}: ${e}`);
    return ctx.badRequest(`Failed to add exam ${body.title}`);
  }

  logger.info(`Added exam ${newExam._id} for ${ctx.state.user._id}`);
  ctx.created({
    createdExam: newExam
  });
}

async function editExam (ctx) {
  const examID = ctx.params.examID;
  const updates = ctx.request.body;

  const allowedProperties = [
    'title',
    'description',
    'date',
    'courseCRN',
    'timeEstimate',
    'priority'
  ];

  // Ensure no unallowed properties are passed to update
  if (Object.keys(updates).some(prop => !allowedProperties.includes(prop))) {
    logger.error(
      `Failed to update exam for ${
        ctx.state.user.rcs_id
      } because of invalid update properties.`
    );
    return ctx.badRequest('Passed unallowed properties.');
  }

  // Limit to this semester
  if (
    !moment(updates.date).isBetween(
      ctx.session.currentTerm.start,
      ctx.session.currentTerm.end
    )
  ) {
    logger.error(
      `${ctx.state.user.rcs_id} tried to set exam outside of current semester.`
    );
    return ctx.badRequest(
      'You cannot set an exam due outisde of this semester.'
    );
  }

  // Update exam
  ctx.state.exam.set(updates);

  try {
    await ctx.state.exam.save();
  } catch (e) {
    logger.error(
      `Failed to update exam ${examID} for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('There was an error updating the exam.');
  }

  logger.info(
    `Updated exam ${ctx.state.exam._id} for ${ctx.state.user.rcs_id}.`
  );

  ctx.ok({
    updatedExam: ctx.state.exam
  });
}

/**
 * Given an exam ID, remove the exam only if it belongs to the logged in user.
 * The exam ID should be in the params of the request.
 *
 * POST /exams/e/:examID/remove
 * @param {Koa context} ctx
 * @returns The removed exam.
 */
async function removeExam (ctx) {
  const examID = ctx.params.examID;

  // Remove exam
  try {
    ctx.state.exam.remove();
  } catch (e) {
    return ctx.internalServerError('There was an error removing the exam.');
  }

  logger.info(
    `Removed exam ${ctx.state.exam._id} for ${ctx.state.user.rcs_id}`
  );

  ctx.ok({
    removedExam: ctx.state.exam
  });
}

/* COMMENTS */
/**
 * Add a comment to an exam. The request body should contain the following:
 * - comment: the text of the comment
 *
 * @param {Koa context} ctx
 * @returns The updated exam
 */
async function addComment (ctx) {
  const examID = ctx.params.examID;
  const text = ctx.request.body.comment;

  // Add comment
  ctx.state.exam.comments.push({
    addedAt: new Date(),
    body: text
  });

  try {
    await ctx.state.assignment.save();
  } catch (e) {
    logger.error(
      `Failed to save exam ${examID} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('There was an error adding the comment.');
  }

  ctx.ok({ updatedExam: ctx.state.exam });
}

/**
 * Delete a comment on an exam. The request url should contain the following:
 * - index: the index of the comment to delete
 *
 * @param {Koa context} ctx
 * @returns The updated exam
 */
async function deleteComment (ctx) {
  const examID = ctx.params.examID;

  const index = ctx.params.commentIndex;

  // Remove the comment by its index
  ctx.state.exam.comments.splice(index, 1);

  try {
    await ctx.state.exam.save();
  } catch (e) {
    logger.error(
      `Failed to save exam ${examID} for ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('There was an error adding the comment.');
  }

  ctx.ok({ updatedExam: ctx.state.exam });
}

module.exports = {
  getExamMiddleware,
  getExams,
  getExam,
  createExam,
  editExam,
  removeExam,
  addComment,
  deleteComment
};
