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

// This will help us find assignments due on a certain date
schema.query.dueOn = function(date) {
  if (!date) date = new Date();

  return this.where({
    dueDate: {
      $gte: moment(date).startOf('day'),
      $lt: moment(date).endOf('day')
    }
  });
};

// With this we can do something like
// Assignments.dueBy(tomorrow).find();
schema.query.dueBy = function(date) {
  if (!date) date = new Date();

  return this.where({
    dueDate: { $gte: moment().startOf('day'), $lte: moment(date).endOf('day') }
  });
};

module.exports = {
  name: 'Assignment',
  schema
};
