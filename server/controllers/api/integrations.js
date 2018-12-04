const logger = require('../../logger');
const SMS = require('../../sms');

const { dmStudent } = require('../../discord').utils;

/**
 * Get a SMS verification code and send it to the user's given phone number.
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
  let message;
  try {
    message = await SMS.sendText(
      phoneNumber,
      `Your LATE verification code is: ${code}`
    );
  } catch (e) {
    logger.error(
      `Failed to send SMS verification code to ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.internalServerError(
      `Failed to send verification code to ${phoneNumber}.`
    );
  }

  logger.info(`Sent SMS verification code to ${ctx.state.user.rcs_id}.`);
  ctx.ok(`Successfully sent SMS verification code to ${phoneNumber}.`);
}

/**
 * Attempt to verify a user's phone number with the verification code.
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

  ctx.state.user.integrations.sms.verificationCode = undefined;
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

/**
 * Update SMS integration preferences passed in the request body.
 *
 * @param {Koa context} ctx
 */
async function updatePreferencesSMS (ctx) {
  const preferences = ctx.request.body;

  Object.assign(ctx.state.user.integrations.sms.preferences, preferences);

  try {
    await ctx.state.user.save();
  } catch (e) {
    logger.error(
      `Failed to update SMS preferences for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('Failed to update SMS preferences.');
  }

  logger.info(`Updated SMS preferences for ${ctx.state.user.rcs_id}.`);
  ctx.ok({ updatedUser: ctx.state.user });
}

/**
 * Get a random verification code, save it to the user, and return it.
 *
 * @param {Koa context} ctx
 */
async function startVerifyDiscord (ctx) {
  const code = (ctx.state.user.integrations.discord.verificationCode = Math.random()
    .toString(36)
    .substr(2, 5));

  try {
    await ctx.state.user.save();
  } catch (e) {
    logger.error(
      `Failed to start verifying Discord for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('Error getting verification code.');
  }

  logger.info(
    `Generated Discord verification code for ${ctx.state.user.rcs_id}.`
  );
  ctx.ok({ verificationCode: code });
}

/**
 * Update Discord preferences passed in the request body.
 *
 * @param {Koa context} ctx
 */
async function updatePreferencesDiscord (ctx) {
  const preferences = ctx.request.body;

  Object.assign(ctx.state.user.integrations.discord.preferences, preferences);

  try {
    await ctx.state.user.save();
  } catch (e) {
    logger.error(
      `Failed to update Discord preferences for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('Failed to update Discord preferences.');
  }

  dmStudent(ctx.state.user, 'You updated your preferences!');

  logger.info(`Updated Discord preferences for ${ctx.state.user.rcs_id}.`);
  ctx.ok({ updatedUser: ctx.state.user });
}

/**
 * Update email integration preferences passed in the request body.
 *
 * @param {Koa context} ctx
 */
async function updatePreferencesEmail (ctx) {
  const preferences = ctx.request.body;

  Object.assign(ctx.state.user.integrations.email.preferences, preferences);

  try {
    await ctx.state.user.save();
  } catch (e) {
    logger.error(
      `Failed to update email preferences for ${ctx.state.user.rcs_id}: ${e}`
    );
    return ctx.badRequest('Failed to update email preferences.');
  }

  logger.info(`Updated email preferences for ${ctx.state.user.rcs_id}.`);
  ctx.ok({ updatedUser: ctx.state.user });
}

module.exports = {
  submitSMS,
  verifySMS,
  updatePreferencesSMS,
  startVerifyDiscord,
  updatePreferencesDiscord,
  updatePreferencesEmail
};
