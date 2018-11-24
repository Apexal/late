const logger = require('../../logger');
const SMS = require('../../sms');

/**
 *
 * @param {Koa context} ctx
 */
async function submitSMS (ctx) {
  const phoneNumber = ctx.request.body.phoneNumber;

  if (!phoneNumber) {
    logger.error(
      `Failed to submit phone number for ${
        ctx.state.user.rcs_id
      }: Missing phoneNumber in request body.`
    );
    return ctx.badRequest('Missing phoneNumber in request body.');
  }

  ctx.state.user.integrations.sms.verified = false;
  ctx.state.user.integrations.sms.phoneNumber = phoneNumber;

  // Generate verification code
  const code = (ctx.state.user.integrations.sms.verificationCode = Math.random()
    .toString(36)
    .substr(2, 5));

  try {
    await ctx.state.user.save();
  } catch (e) {
    logger.error(
      `Failed to submit unverified phone number of ${
        ctx.state.user.rcs_id
      }: ${e}`
    );
    return ctx.badRequest('There was an error submitting your phone number.');
  }

  // Send text to the given number
  const message = await SMS.sendText(
    phoneNumber,
    `Your LATE verification code is: ${code}`
  );

  logger.info(`Sent SMS verification code to ${ctx.state.user.rcs_id}.`);
  ctx.ok(`Successfully sent SMS verification code to ${phoneNumber}.`);
}

/**
 *
 * @param {Koa context} ctx
 */
async function verifySMS (ctx) {
  const code = ctx.request.body.verificationCode;

  if (!code) {
    logger.error(
      `Failed to verify SMS for ${
        ctx.state.user.rcs_id
      }: Request body missing verificationCode.`
    );
    return ctx.badRequest('You did not enter the verification code!');
  }

  if (ctx.state.user.integrations.sms.verificationCode !== code) {
    logger.error(
      `Failed to verify SMS for ${
        ctx.state.user.rcs_id
      }: Incorrect verification code.`
    );
    return ctx.unauthorized('Incorrect verification code.');
  }

  ctx.state.user.integrations.sms.verificationCode = null;
  ctx.state.user.integrations.sms.verified = true;

  try {
    await ctx.state.user.save();
  } catch (e) {
    logger.error(
      `Failed to verify phone number of ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('There was an error verifying your phone number.');
  }

  ctx.ok({ updatedUser: ctx.state.user });
}

module.exports = {
  submitSMS,
  verifySMS
};
