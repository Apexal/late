const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    text: { type: String, minlength: 1, maxlength: 3000, required: true },
    _blocks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Block'
      }
    ],
    completed: { type: Date, default: null }
  },
  { timestamps: true }
)

schema.set('toObject', { getters: true, virtuals: true })
schema.set('toJSON', { getters: true, virtuals: true })

module.exports = mongoose.model('Todo', schema)
