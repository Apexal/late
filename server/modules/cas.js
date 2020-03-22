const logger = require('./logger')

const passport = require('koa-passport')
const CasStrategy = require('passport-cas2').Strategy
const discordClient = require('../integrations/discord').client

const { sendDiscordWebhookMessage } = require('../modules/webhooks')
const { sendNewUserEmail } = require('../integrations/email')
const { getNameAndMajor } = require('../modules/directory')

const Student = require('../api/students/students.model')

passport.serializeUser((user, done) => {
  done(null, user.rcs_id)
})

passport.deserializeUser(async (rcsId, done) => {
  try {
    const user = await Student.findOne().byUsername(rcsId)
    return done(null, user)
  } catch (err) {
    return done(err)
  }
})

const cas = new CasStrategy({
  casURL: 'https://cas-auth.rpi.edu/cas'
}, async function getOrCreateStudent (username, profile, done) {
  username = username.toLowerCase()
  try {
    let student = await Student.findOne().byUsername(username)

    if (student) {
      if (process.env.NODE_ENV !== 'development') {
        try {
          discordClient.guilds
            .find(guild => guild.id === process.env.DISCORD_SERVER_ID)
            .channels.find(channel => channel.name === 'log')
            .send(`**${student.displayName}** *(${student.rcs_id})* has logged in.`)
        } catch (e) {}
      }
      logger.info(`Logging in student '${username}'...`)
    } else {
      // New user!!
      logger.info(`Creating new student '${username}'...`)

      student = Student({
        rcs_id: username,
        accountLocked: true // WAITLIST
      })

      try {
        const directoryData = await getNameAndMajor(username)
        if (directoryData.name.first && directoryData.name.last) {
          student.name = directoryData.name
        }
        if (directoryData.major) {
          student.major = directoryData.major
        }
      } catch (e) {
        // Couldn't get name and major from directory
      }

      if (process.env.NODE_ENV !== 'development') {
        sendNewUserEmail(username)
        sendDiscordWebhookMessage(`**${username}** has joined the waitlist!`) // may fail
      }
    }

    student.lastLogin = new Date()

    await student.save()

    if (student.accountLocked) return done(new Error('Account locked.'))

    return done(null, student)
  } catch (e) {
    return done(e)
  }
})

passport.use(cas)

module.exports = cas
