const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

const Twilio = require('twilio');
const client = new Twilio(accountSid, authToken);

const sanitizePhoneNumber = number => '+1' + number.replace('-', '');

async function sendText (to, body) {
  return client.messages.create({
    from: phoneNumber,
    body,
    to: sanitizePhoneNumber(to)
  });
}

module.exports = { client, sendText };
