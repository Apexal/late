const config = require('config');
const CAS = require('koa2-cas');
const logger = require('./logger');

const cas = new CAS({
  cas_url: 'https://cas-auth.rpi.edu/cas',
  service_url: `http://${config.get('server.base_url')}:${config.get(
    'server.port'
  )}`,
  cas_version: '3.0'
});

/**
 * Middleware called after CAS returns a username.
 * Creates student in database if first login.
 */
async function loginStudent(ctx) {
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

  ctx.request.flash('success', 'Successfully logged in.');

  // Check if user has things to setup and redirect to the setup page if they do
  if (student.next_to_setup) ctx.redirect(`/setup/${student.next_to_setup}`);
  else ctx.redirect(ctx.query.redirectTo);
}

module.exports = { cas, loginStudent };
