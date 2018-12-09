const db = require('../../../../db').models;
const logger = require('../../../modules/logger');

module.exports = {
  name: 'verify',
  uses: {
    'Connect your LATE account to your Discord account with the verification code from LATE.':
      '<code>'
  },
  dmEnabled: true,
  async run (client, msg, args) {
    // Find student based on given code
    if (args.length === 0) {
      throw new Error('You must give a verification code!');
    }

    const code = args[0];
    const student = await db.Student.findOne({
      'integrations.discord.verificationCode': code
    });

    if (!student) {
      throw new Error(
        'Invalid code! Make sure you have logged onto LATE and requested a code there!'
      );
    }

    student.integrations.discord.verified = true;
    student.integrations.discord.verificationCode = undefined;
    student.integrations.discord.userID = msg.author.id;

    await student.save();

    msg.reply(
      `You have connected your account to LATE as **${
        student.display_name
      }.** Refresh LATE to see your Discord integration preferences.`
    );
  }
};
