const Student = require('../../api/students/students.model');
const Term = require('../../api/terms/terms.model');

const moment = require('moment');

async function courseFromCRN (schedules, crn) {
  return schedules.find(c => c.crn === crn);
}

/**
 * Send a student a Discord direct message.
 *
 * @param {Object} student The student object.
 * @param {String} message The message.
 */
async function dmStudent (client, student, message) {
  const author = client.users.get(student.integrations.discord.userID);
  await author.sendMessage(message);
}

/**
 * Get a student from the DB based on their Discord user.
 *
 * @param {Discurd user object} discordUser
 */
async function getStudent (discordUser) {
  return Student.findOne().byDiscordID(discordUser.id);
}

async function generateWorkBlockReminder (
  client,
  terms,
  student,
  assessmentType,
  assessment,
  block
) {
  const lines = [];
  const startStr = moment(block.startTime).format('h:mma');
  const endStr = moment(block.endTime).format('h:mma');

  lines.push(
    `Get ready to ${assessmentType === 'exam' ? 'study for' : 'work on'} \`${
      assessment.title
    }\` from **${startStr}** to **${endStr}**.`
  );

  const message = lines.join('\n');
  dmStudent(client, student, message);
}

module.exports = {
  dmStudent,
  getStudent,
  generateWorkBlockReminder,
  async sendNightlyReportMessage (client, terms, student, missed) {
    const lines = [];
    lines.push('**:\n');
    lines.push(`[${missed.length} Missed Assignments]`);

    for (let a of missed) {
      const course = courseFromCRN(student.semester_schedules, a.courseCRN);

      lines.push(
        `${moment(a.dueDate).format('h:mma')} - ${course.longname} - ${a.title}`
      );
    }
    const message = lines.join('\n');

    // DM student
    this.dmStudent(client, student, message);
  }
};
