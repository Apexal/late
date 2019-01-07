const Student = require('../../api/students/students.model');
const Term = require('../../api/terms/terms.model');

const client = require('./index').client;
const moment = require('moment');

async function courseFromCRN (schedules, crn) {
  return schedules.find(c => c.crn === crn);
}

module.exports = {
  /**
   * Send a student a Discord direct message.
   *
   * @param {Object} student The student object.
   * @param {String} message The message.
   */
  async dmStudent (student, message) {
    const author = client.users.get(student.integrations.discord.userID);
    await author.sendMessage(message);
  },
  /**
   * Get a student from the DB based on their Discord user.
   *
   * @param {Discurd user object} discordUser
   */
  async getStudent (discordUser) {
    return Student.findOne().byDiscordID(discordUser.id);
  },
  async sendNightlyReportMessage (terms, student, missed) {
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
    this.dmStudent(student, message);
  }
};
