const moment = require('moment');
const logger = require('../../modules/logger');

const Exam = require('./exams.model');

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

  let exam;
  try {
    exam = await Exam.findOne({
      _id: examID,
      _student: ctx.state.user._id
    });
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

  logger.info(`Sending exam ${examID} to ${ctx.state.user.rcs_id}`);

  ctx.ok({
    exam
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

  let exam;
  try {
    exam = await Exam.findOne({
      _id: examID,
      _student: ctx.state.user._id
    }).populate('_blocks');
  } catch (e) {
    logger.error(
      `Error finding exam ${examID} for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.internalServerError('There was an error getting the exam.');
  }

  if (!exam) {
    ctx.error(`Could not find exam ${examID} for ${ctx.state.user.rcs_id}.`);
    return ctx.notFound('Could not find exam.');
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
  exam.set(updates);

  try {
    await exam.save();
  } catch (e) {
    logger.error(
      `Failed to update exam ${examID} for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('There was an error updating the exam.');
  }

  logger.info(`Updated exam ${exam._id} for ${ctx.state.user.rcs_id}.`);

  ctx.ok({
    updatedExam: exam
  });
}

module.exports = {
  getExams,
  getExam,
  createExam,
  editExam
};
