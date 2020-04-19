const logger = require('../../modules/logger')
const SMS = require('../../integrations/sms')
const ical = require('node-ical')
const request = require('request-promise')
const moment = require('moment')
const { createIssue, getReleases } = require('../../modules/github')

const CALENDAR_URL = 'http://events.rpi.edu/cal/misc/export.gdo?b=de'

async function submitGitHubIssue (ctx) {
  const { title, description } = ctx.request.body

  // call function from github.js file
  createIssue(ctx.state.user.rcs_id, title, description)
  ctx.ok({ message: 'Submitted issue to GitHub!' })
}

async function getAcademicCalendarEvents (ctx) {
  // const response = await request.post(CALENDAR_URL, {
  //   form: {
  //     calPath: '/user/public-user/Academic Calendar',
  //     nocache: 'no',
  //     contentName: 'Academic Calendar.ics',
  //     dateLimits: 'all'
  //   }
  // })

  const events = {}

  // const parsed = ical.parseICS(response)
  // for (const id in parsed) {
  //   if (
  //     moment(parsed[id].start).isBetween(
  //       ctx.session.currentTerm.startDate,
  //       ctx.session.currentTerm.endDate
  //     )
  //   ) {
  //     events[id] = parsed[id]
  //   }
  // }

  return ctx.ok({ events })
}

/**
 * Get a SMS verification code and send it to the user's given phone number.
 *
 * @param {Koa context} ctx
 */
async function submitSMS (ctx) {
  const phoneNumber = ctx.request.body.phoneNumber.replace(/-/g, '')

  if (!phoneNumber) {
    logger.error(
      `Failed to submit phone number for ${
        ctx.state.user.rcs_id
      }: Missing phoneNumber in request body.`
    )
    return ctx.badRequest('Missing phoneNumber in request body.')
  }

  ctx.state.user.integrations.sms.verified = false
  ctx.state.user.integrations.sms.phoneNumber = phoneNumber

  // Generate verification code
  const code = (ctx.state.user.integrations.sms.verificationCode = Math.random()
    .toString(36)
    .substr(2, 5))

  try {
    await ctx.state.user.save()
  } catch (e) {
    logger.error(
      `Failed to submit unverified phone number of ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.badRequest('There was an error submitting your phone number.')
  }

  // Send text to the given number
  let message
  try {
    message = await SMS.sendText(
      phoneNumber,
      `Your LATE verification code is: ${code}`
    )
  } catch (e) {
    logger.error(
      `Failed to send SMS verification code to ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.internalServerError(
      `Failed to send verification code to ${phoneNumber}.`
    )
  }

  logger.info(`Sent SMS verification code to ${ctx.state.user.identifier}.`)
  ctx.ok(`Successfully sent SMS verification code to ${phoneNumber}.`)
}

/**
 * Attempt to verify a user's phone number with the verification code.
 *
 * @param {Koa context} ctx
 */
async function verifySMS (ctx) {
  const code = ctx.request.body.verificationCode

  if (!code) {
    logger.error(
      `Failed to verify SMS for ${
        ctx.state.user.rcs_id
      }: Request body missing verificationCode.`
    )
    return ctx.badRequest('You did not enter the verification code!')
  }

  if (ctx.state.user.integrations.sms.verificationCode !== code) {
    logger.error(
      `Failed to verify SMS for ${
        ctx.state.user.rcs_id
      }: Incorrect verification code.`
    )
    return ctx.unauthorized('Incorrect verification code.')
  }

  ctx.state.user.integrations.sms.verificationCode = undefined
  ctx.state.user.integrations.sms.verified = true

  ctx.state.user.setup.integrations = true

  try {
    await ctx.state.user.save()
  } catch (e) {
    logger.error(
      `Failed to verify phone number of ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.badRequest('There was an error verifying your phone number.')
  }

  ctx.ok({ updatedUser: ctx.state.user })
}

/**
 * Delete the SMS integration from the user.
 *
 * @param {Koa context} ctx
 */
async function disableSMS (ctx) {
  ctx.state.user.integrations.sms = {
    verified: false
  }
  ctx.state.user.setup.integrations = true

  try {
    await ctx.state.user.save()
  } catch (e) {
    logger.error(`Failed to disable SMS for ${ctx.state.user.identifier}: ${e}`)
    return ctx.badRequest('Failed to disable SMS integration.')
  }

  logger.info(`Disabled SMS integration for ${ctx.state.user.identifier}.`)
  ctx.ok({ updatedUser: ctx.state.user })
}

/**
 * Update user's notification preferences as passed in the request body.
 *
 * @param {Koa context} ctx
 *
 * POST /preferences
 */
async function saveNotificationPreferences (ctx) {
  const preferences = ctx.request.body
  ctx.state.user.notificationPreferences = preferences
  ctx.state.user.setup.integrations = true

  try {
    await ctx.state.user.save()
  } catch (e) {
    logger.error(
      `Failed to update notification preferences for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.badRequest(
      'There was an error updating your notification preferences.'
    )
  }

  logger.info(`Updated notification preferences for ${ctx.state.user.identifier}.`)

  ctx.ok({ updatedUser: ctx.state.user })
}

/**
 * Get the LATE repo's releases as a changelog.
 *
 * **Request Query**
 * - page (optional) Page number for GitHub API (default 1)
 */
async function getChangelog (ctx) {
  const response = await getReleases(ctx.query.page || 1)

  ctx.ok({ releases: response.data })
}

module.exports = {
  getAcademicCalendarEvents,
  submitSMS,
  verifySMS,
  disableSMS,
  saveNotificationPreferences,
  submitGitHubIssue,
  getChangelog
}
