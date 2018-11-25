const Discord = require('discord.js');
const client = new Discord.Client();

const db = require('../db').models;

const moment = require('moment');
const logger = require('./logger');

client.on('ready', () => {
  logger.info(`Discord bot ready as ${client.user.tag}!`);
});

client.on('message', async msg => {
  if (msg.content.startsWith('.verify ') && msg.channel.type === 'dm') {
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
  } else if (msg.content === '.upcoming') {
    // Get student's upcoming assignments
    const student = await getStudent(msg.author);
    if (!student) return;

    const upcomingAssignments = (await student.getAssignments(
      new Date()
    )).filter(a => !a.completed);

    const grouped = {};

    for (let a of upcomingAssignments) {
      const day = moment(a.dueDate)
        .startOf('day')
        .toDate();

      if (!grouped[day]) grouped[day] = [];

      grouped[day].push(a);
    }

    const embed = new Discord.RichEmbed()
      .setTitle('Upcoming Assignments')
      .setAuthor('LATE')
      .setDescription(
        `You have ${
          upcomingAssignments.length
        } incomplete upcoming assignments. Visit LATE to manage them.`
      )
      .setURL(process.env.BASE_URL + '/assignments/upcoming')
      .setFooter(`Updated ${moment().format('MM/DD/YY h:mm a')}`);

    for (let date in grouped) {
      embed.addField(
        '[ ' + moment(date).format('dddd [the] Do') + ' ]',
        grouped[date]
          .map(a => {
            const course = student.courseFromCRN(a.courseCRN);
            return `${course.longname}: *${a.title}*`;
          })
          .join('\n'),
        true
      );
    }

    msg.author.send(embed);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

async function getStudent (discordUser) {
  return db.Student.findOne({ 'integrations.discord.userID': discordUser.id });
}

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
