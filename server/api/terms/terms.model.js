const mongoose = require('mongoose')
const Schema = mongoose.Schema

const moment = require('moment')

const schema = new Schema(
  {
    name: { type: String, required: true }, // e,g. 'Fall 2018'
    code: { type: String, minlength: 6, maxlength: 6, required: true }, // e.g. '201809' This is taken from SIS forms
    start: { type: Date, required: true },
    classesEnd: { type: Date, required: true }, // The last date of classes
    end: { type: Date, required: true }
  },
  { timestamps: true }
)

schema.virtual('isCurrent').get(function () {
  return moment().isBetween(this.start, this.end)
})

module.exports = mongoose.model('Term', schema)
