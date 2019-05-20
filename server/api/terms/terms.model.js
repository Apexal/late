const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moment = require('moment');

const schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, minlength: 6, maxlength: 6, required: true },
    start: { type: Date, required: true },
    classesEnd: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  { timestamps: true }
);

schema.virtual('isCurrent').get(function () {
  return moment().isBetween(this.start, this.end);
});

module.exports = mongoose.model('Term', schema);
