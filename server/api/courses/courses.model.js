const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    originalTitle: { type: String, required: true }, // Remains the same so student can change name but not forget what it originally was
    sectionId: { type: Number, required: true }, // e.g. 11
    title: { type: String, required: true }, // e.g. FOUNDATIONS OF COMPUTER SCIENCE
    termCode: { type: String, required: true }, // e.g. 201901
    startDate: { type: Date, required: true }, // usually start of semester unless weird summer course
    endDate: { type: Date, required: true }, // same as above
    summary: { type: String, required: true }, // e.g. BIOL 1010
    crn: { type: String, required: true }, // e.g. 73691
    color: { type: String, required: true }, // e.g. #68d0a2
    credits: { type: Number, min: 0, max: 10 }, // e.g. 4
    links: { type: Array, default: [] },
    periods: [
      {
        day: { type: Number, required: true, min: 0, max: 6 },
        startTime: { type: String, required: true }, // HH:mm
        endTime: { type: String, required: true }, // HH:mm
        type: { type: String, default: 'LEC' }, // LEC, TES, STU, REC, MET
        location: { type: String, default: '???' }
      }
    ],
    _blocks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Block'
      }
    ],
    gradingCategories: [
      {
        title: { type: String, trim: true, minlength: 1, maxlength: 100 },
        weight: { type: Number, required: true, min: 0, max: 100 }
      }
    ],
    hidden: { type: Boolean, default: false }
  },
  { timestamps: true }
)

schema.set('toObject', { getters: true, virtuals: true })
schema.set('toJSON', { getters: true, virtuals: true })

module.exports = mongoose.model('Course', schema)
