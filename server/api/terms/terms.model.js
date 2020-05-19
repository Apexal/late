const mongoose = require('mongoose')
const Schema = mongoose.Schema

const moment = require('moment')

const schema = new Schema(
  {
    name: { type: String, required: true }, // e,g. 'Fall 2018'
    code: { type: String, minlength: 6, maxlength: 6, required: true }, // e.g. '201809' This is taken from SIS forms
    startDate: { type: Date, required: true },
    classesEndDate: { type: Date, required: true }, // The last date of classes
    endDate: { type: Date, required: true },
    exceptions: [
      {
        date: { type: Date, required: true },
        type: { type: String, enum: ['off', 'replace'], required: true },
        day: { type: Number, min: 1, max: 5 } // Day to replace with (if replacing)
      }
    ]
  },
  { timestamps: true }
)

schema.virtual('isCurrent').get(function () {
  return moment().isBetween(this.startDate, this.endDate)
})

/**
 * Find term where midDate is between
 */
schema.statics.findOneFromDate = function findOneFromDate (midDate) {
  return this.findOne({
    startDate: { $lte: midDate },
    endDate: { $gte: midDate }
  }).exec()
}

module.exports = mongoose.model('Term', schema)
