const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    course: { type: Object, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    publicPrivate: { type: String, required: true },
    members: { type: Array }
  }
)

schema.set('toObject', { getters: true, virtuals: true })
schema.set('toJSON', { getters: true, virtuals: true })

module.exports = mongoose.model('Group', schema)
