const mongoose = require('mongoose');
const moment = require('moment');
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
    shared: { type: Boolean, default: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    locked: { type: Boolean, default: false },
    notified: { type: Boolean, default: false },
    location: { type: String, trim: true, minlength: 1, maxlength: 200 }
  },
  { timestamps: true }
);

schema.set('toObject', { getters: true, virtuals: true });
schema.set('toJSON', { getters: true, virtuals: true });

schema.virtual('passed').get(function () {
  return moment(this.endTime).isBefore(new Date());
});

schema.virtual('duration').get(function () {
  return moment(this.endTime).diff(this.startTime, 'minutes');
});

schema.virtual('asGoogleCalendarEvent').get(function () {
  return {
    id: this._id,
    start: {
      dateTime: this.startTime,
      timezone: 'America/New_York'
    },
    end: {
      dateTime: this.endTime,
      timezone: 'America/New_York'
    }
  };
});

module.exports = mongoose.model('Block', schema);
