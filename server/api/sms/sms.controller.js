const logger = require('../../modules/logger');

const Student = require('../students/students.model');

const MessagingResponse = require('twilio').twiml.MessagingResponse;

async function findStudentFromSMSMiddleware (ctx, next) {
  // Find user with that phone number
  const student = await Student.findOne({
    'integrations.sms.phoneNumber': ctx.request.body.From.substring(2)
  });
  if (!student) {
    const twiml = new MessagingResponse();

    twiml.message(
      'I don\'t know who you are... connect your phone number to LATE on the account page!'
    );

    ctx.set('status', 200);
    ctx.set('Content-Type', 'text/xml');

    ctx.body = twiml.toString();
  } else {
    ctx.state.student = student;
    return next();
  }
}

async function receivedSMS (ctx) {
  const body = ctx.request.body;
  const twiml = new MessagingResponse();

  twiml.message(`Yes Master ${ctx.state.student.name.first}`);

  ctx.set('status', 200);
  ctx.set('Content-Type', 'text/xml');

  ctx.body = twiml.toString();
}

module.exports = {
  findStudentFromSMSMiddleware,
  receivedSMS
};
