const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment')

const Block = require('../blocks/blocks.model')

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    title: { type: String, required: true, minlength: 3, maxlength: 200 },
    description: { type: String, maxlength: 4000, default: '' },
    dueDate: { type: Date, required: true },
    courseCRN: { type: String, required: true }, // CRN
    timeEstimate: { type: Number, required: true, min: 0, max: 696969420 },
    timeRemaining: { type: Number, required: true },
    priority: { type: Number, min: 1, max: 5, default: 3 },
    termCode: {
      type: String
    },
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
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    _blocks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Block'
      }
    ],
    isRecurring: {
      type: Boolean,
      default: false
    },
    _recurringOriginal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    },
    recurringdays: {
      type: Array,
      default: []
    },
    shared: {
      type: Boolean,
      default: false
    },
    sharedWith: {
      // rcs_id's
      type: Array,
      default: []
    },
    confirmed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

schema.set('toObject', { getters: true, virtuals: true })
schema.set('toJSON', { getters: true, virtuals: true })

schema.virtual('identifier').get(function () {
  return `${this.shared ? 'Shared ' : ''}Assignment '${this.title}' (${this._id})`
})

schema.virtual('assessmentType').get(function () {
  return 'assignment'
})

schema.virtual('date').get(function () {
  return this.dueDate
})

schema.virtual('passed').get(function () {
  return moment(this.dueDate).isBefore(new Date())
})

schema.virtual('scheduledTime').get(function () {
  return this._blocks.reduce((acc, block) => acc + block.duration, 0)
})

schema.virtual('scheduledTimeRemaing').get(function () {
  return this._blocks
    .filter(b => !b.passed)
    .reduce((acc, block) => acc + block.duration, 0)
})

schema.virtual('fullyScheduled').get(function () {
  return this.scheduledTime >= this.timeEstimate * 60
})

schema.pre('save', async function () {
  // Delete any work blocks that are passed the assignment date now
  if (!this.isNew) {
    await Block.deleteMany({
      _student: this._student,
      _id: { $in: this._blocks },
      $or: [
        { endTime: { $gt: this.dueDate } },
        { endTime: { $gt: this.completedAt } }
      ]
    })

    this._blocks = this._blocks.filter(b => b.endTime <= this.dueDate)
    if (this.completed) {
      this._blocks = this._blocks.filter(b => b.endTime <= this.completedAt)
    }
  }
})

schema.pre('remove', async function () {
  // Delete any work blocks for this assignment
  await Block.deleteMany({
    _student: this._student,
    _id: { $in: this._blocks }
  })
})

module.exports = mongoose.model('Assignment', schema)
