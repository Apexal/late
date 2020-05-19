const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment')

const Block = require('../blocks/blocks.model')

const google = require('../../modules/google')

const assessmentSchema = require('../assessments/assessment.mixin')

const schema = new Schema(
  {
    ...assessmentSchema,
    priority: { type: Number, min: 1, max: 5, default: 3 },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    tasks: [{
      text: { type: String, minlength: 3, maxlength: 200, required: true },
      addedAt: { type: Date, required: true },
      completed: { type: Boolean, default: false },
      completedAt: Date
    }],
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
    const Student = require('../students/students.model')
    const student = await Student.findOne({ _id: this._student })

    // GCal events
    if (student.integrations.google.calendarID) {
      const blocks = await Block.find({
        _student: this._student,
        _id: { $in: this._blocks },
        $or: [
          { endTime: { $gt: this.dueDate } },
          { endTime: { $gt: this.completedAt } }
        ]
      })

      try {
        await Promise.allSettled(blocks.map(block => google.actions.deleteEvent(student, block.id)))
      } catch (e) {}
    }

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
  const Student = require('../students/students.model')
  const student = await Student.findOne({ _id: this._student })

  if (student.integrations.google.calendarID) {
    try {
      await Promise.allSettled(this._blocks.map(block => google.actions.deleteEvent(student, block.id)))
    } catch (e) {}
  }
  // Delete any work blocks for this assignment
  await Block.deleteMany({
    _student: this._student,
    _id: this._blocks
  })
})

module.exports = mongoose.model('Assignment', schema)
