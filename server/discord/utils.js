const db = require('../../db').models;

const client = require('./index').client;

module.exports = {
  /**
   * Get a student from the DB based on their Discord user.
   *
   * @param {Discurd user object} discordUser
   */
  async getStudent (discordUser) {
    return db.Student.findOne({
      'integrations.discord.userID': discordUser.id
    });
  },

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
