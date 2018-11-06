const CAS = require('koa2-cas');
const logger = require('./logger');

const cas = new CAS({
  cas_url: 'https://cas-auth.rpi.edu/cas',
  service_url: process.env.SERVER_BASE_URL + ':' + process.env.PORT,
  cas_version: '3.0'
});

/**
 * Middleware that finds the student from the session 'cas_user' and
 * creates the student if it does not exist yet.
 *
 * @param {Koa context} ctx
 */
async function loginStudent(ctx) {
  if (!ctx.session.cas_user) await cas.bounce();

  let student = await ctx.db.Student.findOne().byUsername(
    ctx.session.cas_user.toLowerCase()
  );

  if (student) {
    logger.info(`Logging in ${student.rcs_id}`);
  } else {
    // TODO: CMS api to get personal info here
    student = ctx.db.Student({
      rcs_id: ctx.session.cas_user,
      joined_date: new Date()
    });
    logger.info(
      `Creating and logging in new student with rcs_id: ${student.rcs_id}`
    );
  }

  student.last_login = new Date();
  await student.save();

  ctx.redirect(ctx.query.redirectTo || '/');
}

module.exports = { cas, loginStudent };
