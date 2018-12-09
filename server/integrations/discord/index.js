const Discord = require('discord.js');
const client = new Discord.Client();

const path = require('path');
const fs = require('fs');
const logger = require('../../modules/logger');

/* LOAD COMMANDS (taken from Apexal/rpi-bot) */
client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands/')) // Read *all* files in commands folder
  .filter(file => file.endsWith('.js')) // Remove any non JavaScript files
  .map(file => file.slice(0, -3)); // Remove the extension '.js' from each file name in the list

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}
logger.info(`Loaded ${commandFiles.length} Discord commands`);

client.on('ready', () => {
  logger.info(`Discord bot ready as ${client.user.tag}!`);
});

const prefix = process.env.DISCORD_BOT_COMMAND_PREFIX;
logger.info(`Discord command prefix is ${prefix}`);
client.on('message', async msg => {
  if (msg.content.startsWith(prefix)) {
    // Potentially a command
    let [commandName, ...args] = msg.content.split(/ +/);
    commandName = commandName.substring(1); // Remove prefix

    if (client.commands.has(commandName)) {
      const command = client.commands.get(commandName);

      // logger.log(`[Discord] Executing command \`${msg.content}\`.`);

      try {
        await command.run(client, msg, args);
      } catch (e) {
        msg.reply(`**Command Failed:** ${e.message}`);
      }
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

const utils = {
  /**
   * Send a student a Discord direct message.
   *
   * @param {Object} student The student object.
   * @param {String} message The message.
   */
  async dmStudent (student, message) {
    const author = client.users.get(student.integrations.discord.userID);
    await author.sendMessage(message);
  }
};

module.exports = {
  client,
  utils
};
