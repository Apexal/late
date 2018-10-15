const moment = require('moment');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, maxlength: 4000 },
  dueDate: { type: Date, required: true },
  course: { type: String, required: true }, // CRN
  timeEstimate: { type: Number, required: true, min: 0, max: 696969420 },
  timeRemaining: { type: Number, required: true },
  isAssessment: { type: Boolean, required: true },
  priority: { type: Number, min: 0, max: 10 },
  _blocks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block'
    }
  ]
});

/* QUERY HELPERS */
schema.query.dueOn = function(date) {
  return this.where({
    dueDate: {
      $gte: moment(date).startOf('day'),
      $lt: moment(date).endOf('day')
    }
  });
};

schema.query.dueBy = function(date) {
  return this.where({
    dueDate: { $gte: moment().startOf('day'), $lte: moment(date).endOf('day') }
  });
};

module.exports = {
  name: 'Assignment',
  schema
};
