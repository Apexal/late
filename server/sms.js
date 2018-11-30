const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
const moment = require('moment');

const Twilio = require('twilio');
const client = new Twilio(accountSid, authToken);

const sanitizePhoneNumber = number => '+1' + number.replace('-', '');

function courseFromCRN (student, crn) {
  return student.current_schedule.filter(c => c.crn === crn)[0];
}

async function sendText (to, body) {
  return client.messages.create({
    from: phoneNumber,
    body,
    to: sanitizePhoneNumber(to)
  });
}

/* UTILS */
const utils = {
  async generateNightlyReport (student, missed) {
    const lines = [];
    lines.push(
      'Good evening from LATE! Here is your nightly progress report:\n'
    );
    lines.push(`[${missed.length} Missed Assignments]`);

    for (let a of missed) {
      const course = courseFromCRN(student, a.courseCRN);

      lines.push(
        `${moment(a.dueDate).format('h:mma')} - ${course.longname} - ${a.title}`
      );
    }
    const message = lines.join('\n');
    await sendText(student.integrations.sms.phoneNumber, message);
  }
};

module.exports = { client, sendText, utils };
