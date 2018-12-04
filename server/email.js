const logger = require('./logger');
const moment = require('moment');

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
  },
  async sendMorningReportEmail (student) {
    // Compile periods for the day
    // const day = moment().day();
    /* const periods = student.current_schedule
      .map(course => {
        course.periods.forEach(p => (p.course = course));
        return course.periods.filter(p => p.day === day);
      })
      .flat()
      .sort((a, b) => parseInt(a.start) - parseInt(b.start));
    */
    const assignmentsDueToday = await student.getAssignments(
      moment().startOf('day'),
      moment().endOf('day')
    );

    logger.info(`Sending new user email to ${student.rcs_id}@rpi.edu`);
    return sgMail.send({
      to: student.rcs_id + '@rpi.edu',
      from: 'LATE <thefrankmatranga@gmail.com>',
      subject: 'Morning Report',
      templateId: 'd-dfb84e300f34479896c697feae156c8a',
      dynamic_template_data: {
        dateString: moment().format('dddd, MMM Do YYYY'),
        student,
        periods: [],
        assignmentsDueToday
      }
    });
  }
};

module.exports = emailFunctions;
