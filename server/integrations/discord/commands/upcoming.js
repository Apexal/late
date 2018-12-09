const Discord = require('discord.js');
const moment = require('moment');

const logger = require('../../../logger');
const { getStudent } = require('../utils');

module.exports = {
  name: 'upcoming',
  uses: {
    'View your upcoming assignments.': ''
  },
  dmEnabled: true,
  async run (client, msg, args) {
    // Get student's upcoming assignments
    const student = await getStudent(msg.author);

    // User hasn't used LATE yet, or has not yet connected to LATE
    if (!student) {
      msg.reply(
        `You have not connected to LATE yet! Goto ${
          process.env.BASE_URL
        } to start.`
      );
      return;
    }

    // Find upcoming assignments (dueDate is after current datetime)
    const upcomingAssignments = (await student.getAssignments(
      new Date()
    )).filter(a => !a.completed);

    // Group by due dates
    const grouped = {};
    for (let a of upcomingAssignments) {
      const day = moment(new Date(a.dueDate))
        .startOf('day')
        .toDate();

      if (!grouped[day]) grouped[day] = [];

      grouped[day].push(a);
    }

    // Create fancy embed message to display info better
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
        '[ ' + moment(new Date(date)).format('dddd [the] Do') + ' ]',
        grouped[date]
          .map(a => {
            const course = student.courseFromCRN(a.courseCRN);
            return `${course.longname}: *${a.title}* (${moment(
              a.dueDate
            ).format('h:mma')})`;
          })
          .join('\n'),
        true
      );
    }

    msg.author.send(embed);
  }
};
