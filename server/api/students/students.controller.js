const logger = require('../../modules/logger');
const fs = require('fs').promises;
const path = require('path');

const Student = require('./students.model');
const Assignment = require('../assignments/assignments.model');
const Exam = require('../exams/exams.model');
const Block = require('../blocks/blocks.model');

/**
 * Only available in development mode. Login as a user given their ID.
 *
 * @param {Koa session} ctx
 **/
async function loginAs (ctx) {
  if (ctx.state.env !== 'development') {
    return ctx.forbidden('Not in development mode.');
  }

  const rcsID = ctx.request.query.rcs_id;
  ctx.session.cas_user = rcsID;
  logger.info(`Logging in as ${rcsID}`);

  let student = await Student.findOne()
    .byUsername(ctx.session.cas_user.toLowerCase())
    .exec();
  if (!student) {
    student = Student({
      rcs_id: ctx.session.cas_user,
      joined_date: new Date(),
      last_login: new Date()
    });
    await student.save();
    logger.info('Created new user for testing.');
  }
  ctx.state.user = student;

  await getUser(ctx);
}

async function getUser (ctx) {
  logger.info(`Getting user info for ${ctx.state.user.rcs_id}`);

  ctx.ok({
    user: ctx.state.user
  });
}

async function getStudents (ctx) {
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!');
  }

  logger.info(`Getting all students for ${ctx.state.user.rcs_id}`);
  let students = await Student.find();
  ctx.ok({ students });
}

async function getStudent (ctx) {
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!');
  }
  const studentID = ctx.params.studentID;

  logger.info(`Getting student ${studentID} for ${ctx.state.user.rcs_id}`);
  let student = await Student.findById(studentID);
  if (!student) {
    logger.error(
      `Failed to find student ${studentID} for ${ctx.state.user.rcs_id}`
    );
    return ctx.notFound(`Student ${studentID} not found.`);
  }
  let counts = {};
  if (ctx.query.counts) {
    // Also get stats
    counts.assignments = await Assignment.count({ _student: studentID });
    counts.exams = await Exam.count({ _student: studentID });
    counts.blocks = await Block.count({ _student: studentID });
  }
  ctx.ok({ student, counts });
}

/**
 * Edit a student's properties iff the logged in user is an admin.
 *
 * Request body should be object of updates, e.g.:
 * { graduationYear: 2022, name: { first: 'Foo', last: 'bar' } }
 *
 * @param {Koa context} ctx
 * @returns The updated student
 */
async function editStudent (ctx) {
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!');
  }
  const studentID = ctx.params.studentID;

  let student = await Student.findById(studentID);
  if (!student) {
    logger.error(
      `Failed to find student ${studentID} for admin ${ctx.state.user.rcs_id}`
    );
    return ctx.notFound(`Student ${studentID} not found.`);
  }

  delete ctx.request.body._id; // Cannot change a user's _id!
  delete ctx.request.body.rcs_id; // Cannot change a user's rcs_id!
  student.set(ctx.request.body);

  try {
    await student.save();
  } catch (e) {
    logger.error(
      `Failed to update student ${studentID} for admin ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('There was an error updating the student.');
  }

  ctx.ok({
    updatedStudent: student
  });
}

async function deleteStudent (ctx) {
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!');
  }
  const studentID = ctx.params.studentID;

  if (ctx.state.user.rcs_id !== 'matraf') {
    return ctx.forbidden('Only Frank can delete accounts!');
  }

  let student = await Student.findById(studentID);
  if (!student) {
    logger.error(
      `Failed to find student ${studentID} for admin ${ctx.state.user.rcs_id}`
    );
    return ctx.notFound(`Student ${studentID} not found.`);
  }

  try {
    await student.remove();
  } catch (e) {
    logger.error(
      `Failed to remove student ${studentID} for admin ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('There was an error deleting the student.');
  }

  ctx.ok({
    deletedStudent: student
  });
}

async function getStudentCounts (ctx) {
  let testers = await Student.count({ accountLocked: false });
  let waitlist = await Student.count({ accountLocked: true });

  return ctx.ok({ waitlist, testers });
}

async function getLog (ctx) {
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!');
  }
  const log = (await fs.readFile(
    path.join(__dirname, '..', '..', '..', 'logs', 'combined.log'),
    'utf8'
  ))
    .toString()
    .split('\n');
  ctx.ok({ log });
}

module.exports = {
  loginAs,
  getUser,
  getStudent,
  editStudent,
  deleteStudent,
  getStudents,
  getStudentCounts,
  getLog
};
