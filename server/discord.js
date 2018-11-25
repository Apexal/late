const Discord = require('discord.js');
const client = new Discord.Client();

const db = require('../db').models;

const logger = require('./logger');

client.on('ready', () => {
  logger.info(`Discord bot ready as ${client.user.tag}!`);
});

client.on('message', async msg => {
  if (msg.content.startsWith('~verify ') && msg.channel.type === 'dm') {
    // find user
    const code = msg.content.split(' ')[1];
    const student = await db.Student.findOne({
      'integrations.discord.verificationCode': code
    });
    if (!student) return;

    student.integrations.discord.verified = true;
    student.integrations.discord.verificationCode = undefined;
    student.integrations.discord.userID = msg.author.id;

    await student.save();

    msg.reply(`Thank you for verifying, **${student.display_name}.**`);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

/**
 * Send a student a Discord direct message.
 *
 * @param {Object} student The student object.
 * @param {String} message The message.
 */
async function dmStudent (student, message) {
  const author = client.users.get(student.integrations.discord.userID);
  await author.sendMessage(message);
}

module.exports = {
  client,
  dmStudent
};
