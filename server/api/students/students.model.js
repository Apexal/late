const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const Block = require('../blocks/blocks.model');
const Assignment = require('../assignments/assignments.model');
const Exam = require('../exams/exams.model');

// const rpiValidator = require('rpi-validator');

const schema = new Schema(
  {
    accountLocked: { type: Boolean, default: false },
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
    semester_schedules: { type: Object, default: {} },
    earliestWorkTime: {
      type: String,
      minlength: 5,
      maxlength: 5,
      default: '06:00'
    },
    latestWorkTime: {
      type: String,
      minlength: 5,
      maxlength: 5,
      default: '23:00'
    },
    unavailability_schedules: { type: Object, default: {} },
    admin: { type: Boolean, default: false },
    notificationPreferences: {
      preWorkBlockReminders: {
        type: String,
        enum: ['', 'sms', 'discord'],
        default: ''
      },
      postWorkBlockReminders: {
        type: String,
        enum: ['', 'sms', 'discord'],
        default: ''
      },
      morningReports: {
        type: String,
        enum: ['', 'email', 'discord'],
        default: ''
      },
      addAssignmentReminders: {
        type: String,
        enum: ['', 'sms', 'discord'],
        default: ''
      }
    },
    integrations: {
      sms: {
        verified: { type: Boolean, default: false },
        verificationCode: { type: String, minlength: 1 },
        phoneNumber: { type: String, minlength: 10, maxlength: 10 }
      },
      discord: {
        verified: { type: Boolean, default: false },
        verificationCode: { type: String, minlength: 1 },
        userID: { type: String }
      }
    },
    setup: {
      personal_info: {
        type: Boolean,
        default: false
      }, // what CMS API will give us
      course_schedule: {
        type: Array,
        default: [] // semester codes like ['201809', '201901']
      }, // what SIS and YACS will give us
      unavailability: {
        type: Array,
        default: [] // semester codes like ['201809', '201901']
      }, // when the student cannot study or work
      integrations: {
        type: Boolean,
        default: false
      } // when the student has setup (or chosen not to setup) integrations
    },
    joined_date: {
      type: Date,
      required: true
    },
    last_login: Date
  },
  { timestamps: true }
);

schema.set('toObject', { getters: true, virtuals: true });
schema.set('toJSON', { getters: true, virtuals: true });

/* QUERY HELPERS */
// https://mongoosejs.com/docs/guide.html#query-helpers

schema.query.byUsername = function (rcsID) {
  return this.where({
    rcs_id: rcsID
  });
};

schema.query.byDiscordID = function (discordID) {
  return this.where({
    'integrations.discord.userID': discordID
  });
};

/* METHODS */

schema.methods.courseFromCRN = function (currentTermCode, crn) {
  return this.semester_schedules[currentTermCode].find(c => c.crn === crn);
};

schema.methods.getAssignments = function (start, end, title, courseCRN) {
  let query = {
    _student: this._id
  };

  if (start) {
    query.dueDate = query.dueDate || {};
    query.dueDate['$gte'] = moment(start, 'YYYY-MM-DD', true).toDate();
  }

  if (end) {
    query.dueDate = query.dueDate || {};
    query.dueDate['$lte'] = moment(end, 'YYYY-MM-DD', true).toDate();
  }

  if (title) {
    query.title = new RegExp('^' + title + '$', 'i');
  }

  if (courseCRN) {
    query.courseCRN = courseCRN;
  }

  return this.model('Assignment')
    .find(query)
    .populate('_blocks')
    .sort('dueDate')
    .sort('-priority')
    .exec();
};

schema.methods.getExams = function (start, end, title, courseCRN) {
  let query = {
    _student: this._id
  };

  if (start) {
    query.date = query.date || {};
    query.date['$gte'] = moment(start, 'YYYY-MM-DD', true).toDate();
  }

  if (end) {
    query.date = query.date || {};
    query.date['$lte'] = moment(end, 'YYYY-MM-DD', true).toDate();
  }

  if (title) {
    query.title = new RegExp('^' + title + '$', 'i');
  }

  if (courseCRN) {
    query.courseCRN = courseCRN;
  }

  return this.model('Exam')
    .find(query)
    .populate('_blocks')
    .sort('date')
    .sort('-timeRemaining')
    .exec();
};

/* VIRTUALS */
// https://mongoosejs.com/docs/guide.html#virtuals

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

schema.pre('save', function () {
  this.setup.course_schedule = [...new Set(this.setup.course_schedule)];
  this.setup.unavailability = [...new Set(this.setup.unavailability)];
});

schema.pre('remove', async function () {
  // Delete all work blocks, exams, and assignments from this student
  await Block.deleteMany({
    _student: this._id
  });
  await Assignment.deleteMany({
    _student: this._id
  });
  await Exam.deleteMany({
    _student: this._id
  });
});

module.exports = mongoose.model('Student', schema);
