const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  options: {
    question: String,
    answers: [{ value: Number, text: String, votes: Number }],
    endDate: Date,
    showResults: Boolean
  }
})

module.exports = mongoose.model('Poll', schema)
