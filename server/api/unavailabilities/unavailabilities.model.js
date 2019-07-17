const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    termCode: { type: String, required: true }, // code for semester, e.g. '201901'
    title: { type: String, required: true }, // title for event
    daysOfWeek: { type: Array, required: false }, // Days of week this occurs on e.g. [3, 5] (if it repeats)
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
    isOneTime: { type: Boolean, required: true }
  },
  { timestamps: true }
);

schema.set('toObject', { getters: true, virtuals: true });
schema.set('toJSON', { getters: true, virtuals: true });

module.exports = mongoose.model('Unavailability', schema);
