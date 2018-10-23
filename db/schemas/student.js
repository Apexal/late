const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

//const rpiValidator = require('rpi-validator');

const schema = new Schema({
  rin: {
    type: String
    //required: true
    /*validate: {
      validator: function(rin) {
        return rpiValidator.isRIN(rin);
      },
      message: props => `${props.value} is not a valid RIN!`
    }*/
  },
  name: {
    first: { type: String /*, required: true */ },
    preferred: { type: String },
    last: { type: String /*, required: true */ }
  },
  rcs_id: { type: String, required: true },
  grad_year: { type: Number /*, required: true */ }, // maybe?
  course_schedule: {
    // term: [{ course name, id, and periods }]
  },
  admin: { type: Boolean, default: false },
  setup: {
    personal_info: { type: Boolean, default: false }, // what CMS API will give us
    course_schedule: { type: Boolean, default: false } // what SIS and YACS will give us
    //work_schedule: { type: Boolean, default: false } // when the student can study or work
  },
  joined_date: { type: Date, required: true },
  last_login: Date
});

/* QUERY HELPERS */
// https://mongoosejs.com/docs/guide.html#query-helpers

schema.query.byUsername = function(rcs_id) {
  return this.where({
    rcs_id
  });
};

/* METHODS */

schema.methods.courseFromCRN = function(crn) {
  return this.course_schedule.filter(c => c.crn === crn)[0];
};

schema.methods.findAllAssignments = function(past = false) {
  let query = {
    _student: this._id
  };
  if (!past)
    query.dueDate = {
      $gte: moment()
        .startOf('day')
        .toDate()
    };

  return this.model('Assignment')
    .find(query)
    .sort('dueDate')
    .exec();
};

schema.methods.findAssignmentsDueOn = function(date) {
  return this.model('Assignment')
    .find({
      _student: this._id,
      dueDate: {
        $gte: moment(date).startOf('day'),
        $lte: moment(date).endOf('day')
      }
    })
    .sort('dueDate')
    .exec();
};

schema.methods.findAssignmentsDueBy = function(date, past = false) {
  let query = {
    _student: this._id,
    dueDate: { $lte: moment(date).endOf('day') }
  };
  if (!past)
    query.dueDate = {
      $gte: moment()
        .startOf('day')
        .toDate()
    };

  return this.model('Assignment')
    .find(query)
    .sort('dueDate')
    .exec();
};

/* VIRTUALS */
// https://mongoosejs.com/docs/guide.html#virtuals

schema.virtual('is_setup').get(function() {
  for (let check in this.setup) if (!this.setup[check]) return false;
  return true;
});

schema.virtual('next_to_setup').get(function() {
  for (let check in this.setup) if (!this.setup[check]) return check;
});

schema.virtual('full_name').get(function() {
  return (this.name.preferred || this.name.first) + ' ' + this.name.last;
});

schema.virtual('display_name').get(function() {
  if (this.name.first)
    return `${this.full_name} ${
      this.grad_year ? '\'' + this.grad_year.toString().slice(-2) : ''
    }`;
  else return this.rcs_id;
});

schema.virtual('setup_checks').get(function() {
  return Object.keys(this.setup).filter(check => !check.startsWith('$'));
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
