const logger = require('./logger');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const emailFunctions = {
  async sendNewUserEmail (rcsID) {
    logger.info(`Sending new user email to ${rcsID}@rpi.edu`);
    return sgMail.send({
      to: rcsID + '@rpi.edu',
      from: 'LATE <thefrankmatranga@gmail.com>',
      subject: 'Welcome to LATE',
      templateId: 'd-eeae1b92ce924dc3be9253bf2d5576a3',
      dynamic_template_data: {
        rcsID
      }
    });
  }
};

module.exports = emailFunctions;
