const mongoose = require('mongoose')

/**
 * This object holds the part of the schema for assignments and exams
 * that is shared. It is included in both model files.
 */
module.exports = {
  _student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: { type: String, required: true, minlength: 3, maxlength: 200 },
  description: { type: String, maxlength: 4000, default: '' },
  courseCRN: { type: String, required: true }, // CRN
  timeEstimate: { type: Number, required: true, min: 0, max: 696969420 },
  timeRemaining: { type: Number, required: true },
  termCode: {
    type: String
  },
  _blocks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block'
    }
  ],
  comments: [
    {
      _student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
      },
      addedAt: { type: Date, required: true },
      body: { type: String, minlength: 1, maxlength: 2000, required: true }
    }
  ],
  reminders: [{
    integration: { type: String, enum: ['discord', 'sms', 'email'], required: true },
    count: { type: Number, min: 1, max: 100, required: true },
    unit: { type: String, enum: ['days', 'hours'], required: true },
    datetime: { type: Date },
    sent: { type: Boolean, default: false }
  }]
}
