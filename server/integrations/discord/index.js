const Discord = require('discord.js');
const client = new Discord.Client();

const path = require('path');
const fs = require('fs');
const logger = require('../../modules/logger');

const Term = require('../../api/terms/terms.model');

/* LOAD COMMANDS (taken from Apexal/rpi-bot) */
client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands/')) // Read *all* files in commands folder
  .filter(file => file.endsWith('.js')) // Delete any non JavaScript files
  .map(file => file.slice(0, -3)); // Delete the extension '.js' from each file name in the list

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
    commandName = commandName.substring(1); // Delete prefix

    if (commandName === 'help') {
      const commandTarget = args[0];
      if (!commandTarget) {
      }

      const command = client.commands.get(commandTarget);
      const lines = [
        `**How to use ${
          process.env.DISCORD_BOT_COMMAND_PREFIX
        }${commandTarget}**`
      ];
      for (let use in command.uses) {
        lines.push(
          `\`${process.env.DISCORD_BOT_COMMAND_PREFIX}${commandTarget} ${
            command.uses[use]
          }\`: *${use}*`
        );
      }
      msg.reply(lines.join('\n'));
    } else if (client.commands.has(commandName)) {
      const command = client.commands.get(commandName);

      logger.info(`[Discord] Executing command \`${msg.content}\`.`);

      const terms = await Term.find().sort({ start: -1 });

      try {
        await command.run(client, terms, msg, args);
      } catch (e) {
        logger.error(`[Discord] ${e}`);
        msg.reply(`**Command Failed:** ${e}`);
      }
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = {
  client,
  utils: require('./utils')
};
