const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  options: {
    question: String,
    answers: [{ value: Number, text: String, votes: Number }],
    showResults: { type: Boolean, default: false },
    UID: { type: String, default: '0' }
  },
  voted: { type: Map, of: Boolean, default: {} },
  endDate: { type: Date, default: new Date() }
})

module.exports = mongoose.model('Poll', schema)
