const mongoose = require('mongoose')
const moment = require('moment')
const Schema = mongoose.Schema

const Student = require('../students/students.model')

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    _assessment: {
      type: mongoose.Schema.Types.ObjectId
    },
    _course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    _todo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Todo'
    },
    blockType: { type: String, enum: ['assessment', 'course', 'todo'], default: 'assessment', required: true },
    shared: { type: Boolean, default: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    locked: { type: Boolean, default: false },
    notified: { type: Boolean, default: false },
    location: { type: String, trim: true, minlength: 1, maxlength: 200 }
  },
  { timestamps: true }
)

schema.set('toObject', { getters: true, virtuals: true })
schema.set('toJSON', { getters: true, virtuals: true })

schema.virtual('passed').get(function () {
  return moment(this.endTime).isBefore(new Date())
})

schema.virtual('duration').get(function () {
  return moment(this.endTime).diff(this.startTime, 'minutes')
})

schema.virtual('asGoogleCalendarEvent').get(function () {
  return {
    id: this.id,
    start: {
      dateTime: this.startTime,
      timezone: 'America/New_York'
    },
    end: {
      dateTime: this.endTime,
      timezone: 'America/New_York'
    }
  }
})

module.exports = mongoose.model('Block', schema)
