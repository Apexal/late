const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment')

const Block = require('../blocks/blocks.model')

const google = require('../../modules/google')

const assessmentSchema = require('../assessments/assessment.mixin')

const schema = new Schema(
  {
    ...assessmentSchema,
    date: { type: Date, required: true },
    priority: { type: Number, min: 1, max: 3, default: 2 },
    studyPlan: [
      {
        text: String, // Markdown
        children: [
          {
            text: String,
            completed: Boolean
          }
        ], // nested objects
        completed: Boolean
      }
    ]
  },
  { timestamps: true }
)

schema.set('toObject', { getters: true, virtuals: true })
schema.set('toJSON', { getters: true, virtuals: true })

schema.virtual('identifier').get(function () {
  return `Exam '${this.title}' (${this._id})`
})

schema.virtual('scheduledTime').get(function () {
  return this._blocks.reduce((acc, block) => acc + block.duration, 0)
})

schema.virtual('scheduledTimeRemaing').get(function () {
  return this._blocks
    .filter(b => !b.passed)
    .reduce((acc, block) => acc + block.duration, 0)
})

schema.virtual('passed').get(function () {
  return moment(this.date).isBefore(new Date())
})

schema.virtual('assessmentType').get(function () {
  return 'exam'
})

schema.virtual('fullyScheduled').get(function () {
  return this.scheduledTime >= this.timeEstimate * 60
})

schema.pre('save', async function () {
  // Delete any work blocks that are passed the exam date now
  if (!this.isNew) {
    const Student = require('../students/students.model')
    const student = await Student.findOne({ _id: this._student })

    // GCal events
    if (student.integrations.google.calendarID) {
      const blocks = await Block.find({
        _student: this._student,
        _id: { $in: this._blocks },
        endTime: { $gte: this.date }
      })

      try {
        await Promise.allSettled(blocks.map(block => google.actions.deleteEvent(student, block.id)))
      } catch (e) {}
    }

    await Block.deleteMany({
      _student: this._student,
      _id: { $in: this._blocks },
      endTime: { $gte: this.date }
    })

    this._blocks = this._blocks.filter(b => b.endTime < this.date)
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

  // Delete any work blocks for this exam
  await Block.deleteMany({
    _student: this._student,
    _id: this._blocks
  })
})

module.exports = mongoose.model('Exam', schema)
