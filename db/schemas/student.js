const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

// const rpiValidator = require('rpi-validator');

const CURRENT_TERM = '201809';

const schema = new Schema({
  rin: {
    type: String,
    minlength: 9,
    trim: true
    // required: true
    /* validate: {
      validator: function(rin) {
        return rpiValidator.isRIN(rin);
      },
      message: props => `${props.value} is not a valid RIN!`
    } */
  },
  name: {
    first: {
      type: String,
      trim: true,
      minlength: 1,
      maxlength: 100 /*, required: true */
    },
    preferred: {
      type: String,
      trim: true
    },
    last: {
      type: String,
      trim: true,
      minlength: 1,
      maxlength: 100 /*, required: true */
    }
  },
  rcs_id: {
    type: String,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
    required: true
  },
  grad_year: {
    type: Number,
    min: 2000,
    max: 3000
    /*, required: true */
  }, // maybe?
  semester_schedules: { type: Object, default: { [CURRENT_TERM]: [] } },
  work_schedules: { type: Object, default: { [CURRENT_TERM]: [] } },
  admin: { type: Boolean, default: false },
  setup: {
    personal_info: {
      type: Boolean,
      default: false
    }, // what CMS API will give us
    course_schedule: {
      type: Boolean,
      default: false
    }, // what SIS and YACS will give us
    work_schedule: { type: Boolean, default: false } // when the student can study or work
  },
  joined_date: {
    type: Date,
    required: true
  },
  last_login: Date
});

schema.set('toObject', { getters: true, virtuals: true });
schema.set('toJSON', { getters: true, virtuals: true });

/* QUERY HELPERS */
// https://mongoosejs.com/docs/guide.html#query-helpers

schema.query.byUsername = function (rcsID) {
  return this.where({
    rcs_id: rcsID
  });
};

/* METHODS */

schema.methods.courseFromCRN = function (crn) {
  return this.current_schedule.filter(c => c.crn === crn)[0];
};

schema.methods.findAllAssignments = function (past = false) {
  let query = {
    _student: this._id
  };
  if (!past) {
    query.dueDate = {
      $gte: moment()
        .startOf('day')
        .toDate()
    };
  }

  return this.model('Assignment')
    .find(query)
    .sort('dueDate')
    .sort('-priority')
    .sort('completed')
    .exec();
};

schema.methods.findAssignmentsDueOn = function (date) {
  return this.model('Assignment')
    .find({
      _student: this._id,
      dueDate: {
        $gte: moment(date).startOf('day'),
        $lte: moment(date).endOf('day')
      }
    })
    .sort('dueDate')
    .sort('-priority')
    .sort('completed')
    .exec();
};

schema.methods.findAssignmentsDueBy = function (date, past = false) {
  let query = {
    _student: this._id,
    dueDate: {
      $lte: moment(date).endOf('day')
    }
  };
  if (!past) {
    query.dueDate.$gte = moment()
      .startOf('day')
      .toDate();
  }

  return this.model('Assignment')
    .find(query)
    .sort('dueDate')
    .sort('-priority')
    .sort('completed')
    .exec();
};

/* VIRTUALS */
// https://mongoosejs.com/docs/guide.html#virtuals

schema
  .virtual('current_schedule')
  .get(function () {
    return this.semester_schedules[CURRENT_TERM] || [];
  })
  .set(function (newSchedule) {
    this.semester_schedules[CURRENT_TERM] = newSchedule;
    this.markModified('semester_schedules');
  });

schema
  .virtual('current_work_schedule')
  .get(function () {
    return this.work_schedules[CURRENT_TERM] || [];
  })
  .set(function (newSchedule) {
    this.work_schedules[CURRENT_TERM] = newSchedule;
    this.markModified('work_schedules');
  });

schema.virtual('is_setup').get(function () {
  for (let check in this.setup) if (!this.setup[check]) return false;
  return true;
});

schema.virtual('next_to_setup').get(function () {
  for (let check in this.setup) if (!this.setup[check]) return check;
});

schema.virtual('full_name').get(function () {
  return (this.name.preferred || this.name.first) + ' ' + this.name.last;
});

schema.virtual('display_name').get(function () {
  if (this.name.first) {
    return `${this.full_name} ${
      this.grad_year ? '\'' + this.grad_year.toString().slice(-2) : ''
    }`;
  } else return this.rcs_id;
});

schema.virtual('setup_checks').get(function () {
  return Object.keys(this.setup).filter(check => !check.startsWith('$'));
});

schema.virtual('grade_name').get(function () {
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
