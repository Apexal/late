const logger = require('../../modules/logger');

const Student = require('./students.model');

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
  if (!ctx.state.user.admin) return ctx.forbidden('You are not an administrator!');

  logger.info(`Getting all students for ${ctx.state.user.rcs_id}`);
  let students = await Student.find();
  ctx.ok({ students });
}

module.exports = {
  loginAs,
  getUser,
  getStudents
};
