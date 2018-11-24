const Discord = require('discord.js');
const client = new Discord.Client();

const logger = require('./logger');

client.on('ready', () => {
  logger.info(`Discord bot ready as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = {
  client
};
