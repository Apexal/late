const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  id: Number,
  question: String,
  answers: [{ text: String, votes: Number }]
})

module.exports = mongoose.model('Poll', schema)
