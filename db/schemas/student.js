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
  last_login: Date,
  _assignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    }
  ]
});

/* QUERY HELPERS */
// https://mongoosejs.com/docs/guide.html#query-helpers

/* VIRTUALS */
// https://mongoosejs.com/docs/guide.html#virtuals

schema.virtual('full_name').get(function() {
  return (this.name.preferred || this.name.first) + ' ' + this.name.last;
});

schema.virtual('grade_name').get(function() {
  // TODO: implement properly
  switch (this.grad_year) {
  case 2022:
    return 'Freshman';
  case 2021:
    return 'Sophomore';
  case 2020:
    return 'Junior';
  case 2019:
    return 'Senior';
  default:
    return 'Unknown Grade';
  }
});

module.exports = {
  name: 'Student',
  schema
};
