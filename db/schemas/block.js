const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

// TODO: look into making this a subdocument
// https://mongoosejs.com/docs/subdocs.html

const schema = new Schema(
  {
    _assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true
    },
    startTime: { type: Date, required: true },
    duration: { type: Number, required: true, min: 0 },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

schema.virtual('endTime').get(function () {
  if (!this.startTime) {
    return null;
  }
  return moment(this.startTime)
    .add(this.duration, 'minutes')
    .toDate();
});

module.exports = {
  name: 'Block',
  schema
};
