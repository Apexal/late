const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  _assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  completed: { type: Boolean, default: false }
});

module.exports = {
  name: 'Block',
  schema
};
