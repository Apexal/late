const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    text: { type: String, required: true },
    addedAt: { type: Date, required: true }
  },
  { timestamps: true }
);

schema.set('toObject', { getters: true, virtuals: true });
schema.set('toJSON', { getters: true, virtuals: true });

// use to get todos by user
schema.query.byUsername = function (rcsID) {
  return this.where({
    /* ... */
  });
};
