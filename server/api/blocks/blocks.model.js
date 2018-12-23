const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TODO: look into making this a subdocument
// https://mongoosejs.com/docs/subdocs.html

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Block', schema);
