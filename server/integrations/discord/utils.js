const Student = require('../../api/students/students.model');
const client = require('./index').client;

module.exports = {
  /**
   * Get a student from the DB based on their Discord user.
   *
   * @param {Discurd user object} discordUser
   */
  async getStudent (discordUser) {
    return Student.findOne({
      'integrations.discord.userID': discordUser.id
    });
  }
};
