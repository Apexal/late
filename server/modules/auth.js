const CAS = require('koa2-cas');
const logger = require('./logger');

const Student = require('../api/students/students.model');

const { sendDiscordWebhookMessage } = require('./webhooks');

const { sendNewUserEmail } = require('../integrations/email');

const cas = new CAS({
  cas_url: 'https://cas-auth.rpi.edu/cas',
  service_url: process.env.CAS_SERVICE_URL,
  cas_version: '3.0',
  renew: true
});

/**
 * Middleware that finds the student from the session 'cas_user' and
 * creates the student if it does not exist yet.
 *
 * @param {Koa context} ctx
 */
async function loginStudent (ctx) {
  if (!ctx.session.cas_user) await cas.bounce();

  let student = await Student.findOne().byUsername(
    ctx.session.cas_user.toLowerCase()
  );

  if (student) {
    if (student.accountLocked) {
      logger.info(`${student.rcs_id} tried to login to locked account`);
      ctx.session = null;
      return ctx.redirect('/?waitlisted=1');
    }

    logger.info(`Logging in ${student.rcs_id}`);
  } else {
    // TODO: CMS api to get personal info here
    student = Student({
      rcs_id: ctx.session.cas_user,
      accountLocked: true, // WAIT LIST
      joined_date: new Date()
    });
    /*
    logger.info(
      `Creating and logging in new student with rcs_id: ${student.rcs_id}`
    );
    */
    await student.save();
    logger.info(
      `Creating and adding new user to waitlist with rcs_id: ${student.rcs_id}`
    );
    sendNewUserEmail(student.rcs_id);
    sendDiscordWebhookMessage(`**${student.rcs_id}** has joined the waitlist!`); // may fail
    ctx.session = null;

    ctx.query.redirectTo = '/account';

    return ctx.redirect('/?waitlisted=1');
  }

  student.last_login = new Date();
  await student.save();

  try {
    ctx.state.discordClient.guilds
      .find(guild => guild.id === process.env.DISCORD_SERVER_ID)
      .channels.find(channel => channel.name === 'log')
      .send(`**${student.display_name}** *(${student.rcs_id})* has logged in.`);
  } catch (e) {}

  ctx.redirect(ctx.query.redirectTo || '/');
}

module.exports = { cas, loginStudent };
