const logger = require('../modules/logger')
const request = require('request-promise')
const btoa = require('btoa')
const Student = require('../api/students/students.model')

const cas = require('../modules/cas')
const google = require('../modules/google')

const { getNameAndMajor } = require('../modules/directory')

const { sendDiscordWebhookMessage } = require('../modules/webhooks')

const { sendNewUserEmail } = require('../integrations/email')

// /**
//  * Middleware that finds the student from the session 'cas_user' and
//  * creates the student if it does not exist yet.
//  *
//  * @param {Koa context} ctx
//  */
// async function loginStudent (ctx) {
//   let student = await Student.findOne().byUsername(
//     ctx.session.cas_user.toLowerCase()
//   )

//   const hasInviteCode = ctx.query.inviteCode === (process.env.INVITE_CODE || 'better-late-than-never')

//   if (student && !hasInviteCode) {
//     if (student.accountLocked) {
//       logger.info(`${student.rcs_id} tried to login to locked account`)
//       ctx.session = null
//       return ctx.redirect('/?waitlisted=1')
//     }

//     logger.info(`Logging in ${student.rcs_id}`)
//   } else if (student && hasInviteCode) {
//     student.accountLocked = false
//     logger.info(`${student.rcs_id} was invited and taken off waitlist`)
//   } else if (!student && hasInviteCode) {
//     student = Student({
//       rcs_id: ctx.session.cas_user
//     })
//     logger.info(`${student.rcs_id} was invited and registered`)
//   } else {
//     // TODO: CMS api to get personal info here
//     student = Student({
//       rcs_id: ctx.session.cas_user,
//       accountLocked: true // WAIT LIST
//     })

//     try {
//       const directoryData = await getNameAndMajor(ctx.session.cas_user)
//       if (directoryData.name.first && directoryData.name.last) {
//         student.name = directoryData.name
//       }
//       if (directoryData.major) {
//         student.major = directoryData.major
//       }
//     } catch (e) {
//       // Couldn't get name and major from directory
//     }

//     /*
//     logger.info(
//       `Creating and logging in new student with rcs_id: ${student.rcs_id}`
//     );
//     */
//     await student.save()
//     logger.info(
//       `Creating and adding new user to waitlist with rcs_id: ${student.rcs_id}`
//     )

//     if (process.env.NODE_ENV !== 'development') {
//       sendNewUserEmail(student.rcs_id)
//       sendDiscordWebhookMessage(`**${student.rcs_id}** has joined the waitlist!`) // may fail
//     }

//     ctx.session = null

//     return ctx.redirect('/?waitlisted=1')
//   }

//   student.lastLogin = new Date()
//   await student.save()

//   if (process.env.NODE_ENV !== 'development') {
//     try {
//       ctx.state.discordClient.guilds
//         .find(guild => guild.id === process.env.DISCORD_SERVER_ID)
//         .channels.find(channel => channel.name === 'log')
//         .send(`**${student.displayName}** *(${student.rcs_id})* has logged in.`)
//     } catch (e) {}
//   }

//   if (!student.setup.profile) {
//     ctx.query.redirectTo = '/account'
//   }

//   if (hasInviteCode) {
//     ctx.query.redirectTo += '?invited=1'
//   }

//   ctx.redirect(ctx.query.redirectTo || '/')
// }

async function startGoogleAuth (ctx) {
  const googleAuth = google.createConnection()
  ctx.redirect(google.createUrl(googleAuth))
}

async function googleAuth (ctx) {
  const googleAuth = google.createConnection()

  const { code } = ctx.query
  const { tokens } = await googleAuth.getToken(code)

  Object.assign(ctx.state.user.integrations.google.tokens, tokens)

  googleAuth.setCredentials(tokens)

  const calendar = google.apis.calendar({
    version: 'v3',
    auth: googleAuth
  })

  // Create calendar
  if (!ctx.state.user.integrations.google.calendarID) {
    logger.info(`Creating Google Calendar for ${ctx.state.user.identifier}`)
    let request
    try {
      request = await calendar.calendars.insert({
        requestBody: {
          summary: (process.env.NODE_ENV === 'development' ? '[DEV] ' : '') + 'Coursework (LATE)',
          description: 'This calendar is managed by LATE. Course periods and work/study blocks appear here. Please don\'t edit any events from here.',
          timeZone: 'America/New_York',
          location: 'RPI'
        }
      })

      await calendar.calendarList.patch({
        calendarId: request.data.id,
        requestBody: {
          defaultReminders: [
            {
              method: 'popup',
              minutes: 15
            }
          ]
        }
      })

      ctx.state.user.integrations.google.calendarID = request.data.id

      const termCode = ctx.session.currentTerm.code
      const courses = await ctx.state.user.getCoursesForTerm(termCode)
      await google.actions.createRecurringEventsFromCourseSchedule(googleAuth, request.data.id, termCode, courses)
    } catch (e) {
      logger.error(
        `Failed to create new calendar for ${ctx.state.user.identifier}: ${e}`
      )
      return ctx.badRequest('Failed to create new Google Calendar.')
    }
  }

  await ctx.state.user.save()

  ctx.redirect('/account/integrations#google-calendar')
}

async function startDiscordAuth (ctx) {
  ctx.redirect(process.env.DISCORD_REDIRECT_URL)
}

async function discordAuth (ctx) {
  const { code } = ctx.request.query
  const creds = btoa(
    `${process.env.DISCORD_CLIENT_ID}:${process.env.DISCORD_CLIENT_SECRET}`
  )
  logger.info(`Authenticating ${ctx.state.user.identifier} through Discord...`)
  const tokens = await request({
    uri: `https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${
      process.env.DISCORD_CALLBACK_URL
    }`,
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`
    },
    json: true
  })

  logger.info('Getting Discord user info...')
  // Get info on user (mainly to get their user ID)
  const me = await request({
    uri: 'https://discordapp.com/api/users/@me',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokens.access_token}`
    },
    json: true
  })

  ctx.session.discord_tokens = tokens
  ctx.state.user.integrations.discord = {
    verified: true,
    userID: me.id,
    tokens: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    }
  }

  await ctx.state.user.save()

  // Forcibly add the user to the LATE server ;)
  await request({
    uri: `https://discordapp.com/api/guilds/${
      process.env.DISCORD_SERVER_ID
    }/members/${me.id}`,
    method: 'PUT',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
    },
    body: {
      access_token: tokens.access_token,
      nick: ctx.state.user.displayName,
      roles: [process.env.DISCORD_USER_ROLE_ID]
    },
    json: true
  })
  logger.info(
    `Added ${ctx.state.user.identifier} to the LATE Discord server as @${
      ctx.state.user.displayName
    }`
  )
  ctx.redirect('/account/integrations#discord')
}

module.exports = {
  // loginStudent,
  startGoogleAuth,
  googleAuth,
  startDiscordAuth,
  discordAuth
}
