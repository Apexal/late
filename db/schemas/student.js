const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//const rpiValidator = require('rpi-validator');

const schema = new Schema({
  rin: {
    type: String,
    required: true
    /*validate: {
      validator: function(rin) {
        return rpiValidator.isRIN(rin);
      },
      message: props => `${props.value} is not a valid RIN!`
    }*/
  },
  name: {
    first: { type: String, required: true },
    preferred: { type: String, required: true },
    last: { type: String, required: true }
  },
  rcs_id: { type: String, required: true },
  grad_year: { type: Number, required: true }, // maybe?
  admin: { type: Boolean, default: false },
  setup: {
    personal_info: { type: Boolean, default: false },
    course_schedule: { type: Boolean, default: false },
    free_time: { type: Boolean, default: false }
  },
  joined_date: { type: Date, required: true },
  last_login: Date
});

module.exports = {
  name: 'Student',
  schema
};
