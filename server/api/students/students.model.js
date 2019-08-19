const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment')

const Block = require('../blocks/blocks.model')
const Unavailability = require('../unavailabilities/unavailabilities.model')
const Assignment = require('../assignments/assignments.model')
const Exam = require('../exams/exams.model')
const Todo = require('../todos/todos.model')

// const rpiValidator = require('rpi-validator');

const schema = new Schema(
  {
    accountLocked: { type: Boolean, default: false }, // If true then user is on waitlist and cannot log in to LATE
    name: { // This is used to determine `displayName`
      first: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 100
      },
      preferred: { // Not currently used yet
        type: String,
        trim: true
      },
      last: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 100
      }
    },
    rcs_id: { // The only value we get from RPI CAS when a user logs in; This is the main way to identify users
      type: String,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      required: true
    },
    major: { // The user can enter this manually or have LATE try to guess it from SIS
      type: String,
      trim: true,
      minlength: 1,
      maxlength: 200
    },
    graduationYear: { // The user can enter this manually or have LATE try to guess it from SIS; It's used in `displayName`
      type: Number,
      min: 2000,
      max: 3000
    },
    earliestWorkTime: { // The user manually sets this; It is the earliest time they can study/work (r.g. '09:00' for 9 AM) it will be used when LATE automatically schedules blocks/suggests blocks
      type: String,
      minlength: 5,
      maxlength: 5,
      default: '06:00'
    },
    latestWorkTime: { // Same as above except latest time
      type: String,
      minlength: 5,
      maxlength: 5,
      default: '23:00'
    },
    admin: { type: Boolean, default: false }, // Whether the user is an administrator or not and can therefore access the admin page
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
        verificationCode: { type: String, minlength: 1 }, // Used when verifying someone's phone number
        phoneNumber: { type: String, minlength: 10, maxlength: 10 }
      },
      google: {
        tokens: {
          refresh_token: String,
          access_token: String,
          expiry_date: Number
        },
        calendarID: { type: String } // The id of the "Coursework (LATE)" calendar
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
      },
      course_schedule: {
        type: Array,
        default: [] // semester codes like ['201809', '201901']
      }, // what SIS
      terms: {
        type: Boolean,
        default: false
      },
      unavailability: {
        type: Array,
        default: [] // semester codes like ['201809', '201901']
      }, // when the student cannot study or work
      integrations: {
        type: Boolean,
        default: false
      } // when the student has setup (or chosen not to setup) integrations
    },
    terms: {
      // termCodes for all the terms they will be at school (able to use LATE)
      type: Array,
      default: []
    },
    lastLogin: Date,
    lastSISUpdate: Date // Every time the user imports everything from SIS we update this; If a few months have passed from this date we prompt them to reimport again
  },
  { timestamps: true }
)

schema.set('toObject', { getters: true, virtuals: true })
schema.set('toJSON', { getters: true, virtuals: true })

/* QUERY HELPERS */
// https://mongoosejs.com/docs/guide.html#query-helpers

schema.query.byUsername = function (rcsID) {
  return this.where({
    rcs_id: rcsID
  })
}

schema.query.byDiscordID = function (discordID) {
  return this.where({
    'integrations.discord.userID': discordID
  })
}

/* METHODS */

schema.methods.courseFromCRN = function (termCode, crn) {
  return this.model('Course')
    .findOne({ _student: this._id, termCode, crn })
    .exec()
}

schema.methods.getUserAssignments = function ({
  start,
  end,
  title,
  courseCRN,
  completed,
  confirmed
}) {
  const query = {
    $or: [{ _student: this._id }, { shared: true, sharedWith: this.rcs_id }]
  }

  if (start) {
    query.dueDate = query.dueDate || {}
    query.dueDate['$gte'] = moment(start, 'YYYY-MM-DD', true).toDate()
  }

  if (end) {
    query.dueDate = query.dueDate || {}
    query.dueDate['$lte'] = moment(end, 'YYYY-MM-DD', true).toDate()
  }

  if (title) {
    query.title = new RegExp('^' + title + '$', 'i')
  }

  if (courseCRN) {
    query.courseCRN = courseCRN
  }

  if (completed) {
    query.completed = completed
  }

  if (confirmed) {
    query.confirmed = confirmed
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
    .exec()
}

schema.methods.getExams = function (start, end, title, courseCRN) {
  const query = {
    _student: this._id
  }

  if (start) {
    query.date = query.date || {}
    query.date['$gte'] = moment(start, 'YYYY-MM-DD', true).toDate()
  }

  if (end) {
    query.date = query.date || {}
    query.date['$lte'] = moment(end, 'YYYY-MM-DD', true).toDate()
  }

  if (title) {
    query.title = new RegExp('^' + title + '$', 'i')
  }

  if (courseCRN) {
    query.courseCRN = courseCRN
  }

  return this.model('Exam')
    .find(query)
    .populate('_blocks')
    .populate('_student', '_id rcs_id name graduationYear integrations')
    .sort('date')
    .sort('-timeRemaining')
    .exec()
}

schema.methods.getUnavailabilityForTerm = function (termCode) {
  return this.model('Unavailabiliy')
    .find({ _student: this._id, termCode })
    .exec()
}

schema.methods.getCoursesForTerm = function (termCode) {
  return this.model('Course')
    .find({ _student: this._id, termCode })
    .exec()
}

/* VIRTUALS */
// https://mongoosejs.com/docs/guide.html#virtuals

schema.virtual('fullName').get(function () {
  return (this.name.preferred || this.name.first) + ' ' + this.name.last
})

// Used for chat
schema.virtual('first_name').get(function () {
  return (this.name.preferred || this.name.first)
})

schema.virtual('displayName').get(function () {
  if (this.name.first) {
    return `${this.fullName} ${
      this.graduationYear ? '\'' + this.graduationYear.toString().slice(-2) : ''
    }`
  } else return this.rcs_id
})

schema.virtual('setup_checks').get(function () {
  return Object.keys(this.setup).filter(check => !check.startsWith('$'))
})

schema.virtual('grade_name').get(function () {
  // TODO: implement properly
  switch (this.graduationYear) {
    case 2023:
      return 'Freshman'
    case 2022:
      return 'Sophomore'
    case 2021:
      return 'Junior'
    case 2020:
      return 'Senior'
    default:
      return 'Alumn'
  }
})

/* Remove duplicates in the setup arrays */
schema.pre('save', function () {
  this.setup.course_schedule = [...new Set(this.setup.course_schedule)]
  this.setup.unavailability = [...new Set(this.setup.unavailability)]
})

/* When a user is removed (very very rare), remove all of their associated data. */
schema.pre('remove', async function () {
  // Delete all work blocks, exams, and assignments from this student
  await Block.deleteMany({
    _student: this._id
  })
  await Assignment.deleteMany({
    _student: this._id
  })
  await Exam.deleteMany({
    _student: this._id
  })
  await Todo.deleteMany({
    _student: this._id
  })
})

module.exports = mongoose.model('Student', schema)
