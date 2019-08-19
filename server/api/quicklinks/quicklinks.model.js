const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    category: { type: String, required: true },
    title: { type: String, minlength: 1, maxlength: 200, required: true },
    description: { type: String, maxlength: 1000 },
    url: { type: String, minlength: 1, maxlength: 300, required: true },
    confirmed: { type: Boolean, default: false }
  },
  { timestamps: true }
)

schema.set('toObject', { getters: true, virtuals: true })
schema.set('toJSON', { getters: true, virtuals: true })

module.exports = mongoose.model('QuickLink', schema)
