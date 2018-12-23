const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

module.exports = mongoose.model('Term', schema);
