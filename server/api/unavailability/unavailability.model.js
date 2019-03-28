const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    title: { type: String, required: true }, // title for event
    dow: { type: Array, required: true }, // Days of week this occurs on e.g. [3, 5]
    start: { type: String, required: true }, // HH:mm
    end: { type: String, required: true }, // HH:mm
    isOneTime: { type: Boolean, required: true }
  },
  { timestamps: true }
);

schema.set('toObject', { getters: true, virtuals: true });
schema.set('toJSON', { getters: true, virtuals: true });

module.exports = mongoose.model('Unavailability', schema);
