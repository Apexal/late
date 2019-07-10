const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const Block = require('../blocks/blocks.model');
const Unavailability = require('../unavailabilities/unavailabilities.model');
const Assignment = require('../assignments/assignments.model');
const Exam = require('../exams/exams.model');

// const rpiValidator = require('rpi-validator');

const schema = new Schema(
  {
    accountLocked: { type: Boolean, default: false },
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
    major: {
      type: String,
      trim: true,
      minlength: 1,
      maxlength: 200
    },
    graduationYear: {
      type: Number,
      min: 2000,
      max: 3000
    },
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
    admin: { type: Boolean, default: false },
    notificationPreferences: {
      preWorkBlockReminders: {
        type: String,
        enum: ['', 'google calendar', 'sms', 'discord'],
        default: ''
      },
      postWorkBlockReminders: {
        type: String,
        enum: ['', 'sms', 'discord'],
        default: ''
      },
      weeklyReports: {
        type: String,
        enum: ['', 'email', 'discord'],
        default: ''
      },
      examReminder: {
        type: String,
        enum: ['', 'email', 'sms', 'discord'],
        default: ''
      }
    },
    integrations: {
      sms: {
        verified: { type: Boolean, default: false },
        verificationCode: { type: String, minlength: 1 },
        phoneNumber: { type: String, minlength: 10, maxlength: 10 }
      },
      google: {
        tokens: {
          refresh_token: String,
          access_token: String,
          expiry_date: Number
        },
        calendarIDs: {
          courseSchedule: { type: String, default: '' },
          workBlocks: { type: String, default: '' }
        }
      },
      discord: {
        verified: { type: Boolean, default: false },
        userID: String,
        tokens: {
          accessToken: String,
          refreshToken: String
        }
      }
    },
    setup: {
      profile: {
        type: Boolean,
        default: false
      }, // what CMS API will give us
      course_schedule: {
        type: Array,
        default: [] // semester codes like ['201809', '201901']
      }, // what SIS
      terms: {
        type: Boolean,
        default: false // semester codes like ['201809', '201901']
      },
      unavailability: {
        type: Array,
        default: [] // semester codes like ['201809', '201901']
      }, // when the student cannot study or work
      integrations: {
        type: Boolean,
        default: false
      }, // when the student has setup (or chosen not to setup) integrations
      google: {
        type: Boolean,
        default: false
      } // when the student has connected their Google account
    },
    terms: {
      // termCodes for all the terms they will be at school (able to use LATE)
      type: Array,
      default: []
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

schema.methods.courseFromCRN = function (termCode, crn) {
  return this.model('Course')
    .findOne({ _student: this._id, termCode, crn })
    .exec();
};

schema.methods.getUserAssignments = function ({
  start,
  end,
  title,
  courseCRN,
  completed,
  confirmed
}) {
  let query = {
    $or: [{ _student: this._id }, { shared: true, sharedWith: this.rcs_id }]
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

  if (completed) {
    query.completed = completed;
  }

  if (confirmed) {
    query.confirmed = confirmed;
  }

  return this.model('Assignment')
    .find(query)
    .populate({
      path: '_blocks',
      match: {
        $or: [
          {
            _student: this._id
          },
          {
            shared: true
          }
        ]
      }
    })
    .populate('_student', '_id rcs_id name graduationYear integrations')
    .populate('comments._student', '_id rcs_id name graduationYear')
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
    .populate('_student', '_id rcs_id name graduationYear integrations')
    .sort('date')
    .sort('-timeRemaining')
    .exec();
};

schema.methods.getUnavailabilityForTerm = function (termCode) {
  return this.model('Unavailabiliy')
    .find({ _student: this._id, termCode })
    .exec();
};

schema.methods.getCoursesForTerm = function (termCode) {
  return this.model('Course')
    .find({ _student: this._id, termCode })
    .exec();
};

/* VIRTUALS */
// https://mongoosejs.com/docs/guide.html#virtuals

schema.virtual('full_name').get(function () {
  return (this.name.preferred || this.name.first) + ' ' + this.name.last;
});

// Used for chat
schema.virtual('first_name').get(function () {
  return (this.name.preferred || this.name.first);
});

schema.virtual('display_name').get(function () {
  if (this.name.first) {
    return `${this.full_name} ${
      this.graduationYear ? '\'' + this.graduationYear.toString().slice(-2) : ''
    }`;
  } else return this.rcs_id;
});

schema.virtual('setup_checks').get(function () {
  return Object.keys(this.setup).filter(check => !check.startsWith('$'));
});

schema.virtual('grade_name').get(function () {
  // TODO: implement properly
  switch (this.graduationYear) {
  case 2023:
    return 'Freshman';
  case 2022:
    return 'Sophomore';
  case 2021:
    return 'Junior';
  case 2020:
    return 'Senior';
  default:
    return 'Alumn';
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
