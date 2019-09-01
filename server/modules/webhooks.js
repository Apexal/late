const logger = require('./logger')
const request = require('request-promise')

module.exports = {
  async sendDiscordWebhookMessage (content) {
    try {
      if (!process.env.DISCORD_WEBHOOK_URL) throw new Error('DISCORD_WEBHOOK_URL is not set in the .env file!')
      logger.info((process.env.NODE_ENV === 'development' ? '[DEV] ' : '') + `Sending Discord Webhook Message "${content}".`)
      const req = await request({ uri: process.env.DISCORD_WEBHOOK_URL, method: 'POST', json: true, body: { content } })
      return req
    } catch (e) {
      logger.error(`Failed to send Discord Webhook Message "${content}": ${e}`)
    }
  }
}
