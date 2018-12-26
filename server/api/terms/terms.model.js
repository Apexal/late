const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moment = require('moment');

const schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, minlength: 6, maxlength: 6 },
    start: { type: Date, required: true },
    classesEnd: { type: Date },
    end: { type: Date, required: true },
    isBreak: { type: Boolean, default: false }
  },
  { timestamps: true }
);

schema.virtual('isCurrent').get(function () {
  return moment().isBetween(this.start, this.end);
});

module.exports = mongoose.model('Term', schema);
