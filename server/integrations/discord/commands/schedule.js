const Discord = require('discord.js');

const logger = require('../../../logger');

const moment = require('moment');

const { getStudent } = require('../utils');

module.exports = {
  name: 'schedule',
  uses: {
    'View your class schedule for today.': ''
  },
  dmEnabled: true,
  async run (client, msg, args) {
    // Get student
    const student = await getStudent(msg.author);

    // User hasn't used LATE yet, or has not yet connected to LATE
    if (!student) {
      msg.reply(
        `You have not connected to LATE yet! Goto ${
          process.env.BASE_URL
        } to start.`
      );
    }

    // Get schedule
    // Find periods for current day
    const day = moment().day();
    let dayPeriods = student.current_schedule
      .map(course => {
        course.periods.forEach(p => (p.course = course));
        return course.periods.filter(p => p.day === day);
      })
      .flat()
      .sort((a, b) => parseInt(a.start) - parseInt(b.start));

    const embed = new Discord.RichEmbed();
    embed.setAuthor('LATE');
    embed.setTitle('Today\'s Schedule');

    for (let i in dayPeriods) {
      let p = dayPeriods[i];
      const start = moment(p.start, 'Hmm', true).format('h:mma');
      const end = moment(p.end, 'Hmm', true).format('h:mma');

      embed.addField(p.course.longname, `${start} - ${end} | ${p.location}`);
    }
    msg.author.send(embed);
  }
};
