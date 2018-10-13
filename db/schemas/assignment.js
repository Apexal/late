const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  course: { type: String, required: true },
  timeEstimate: { type: Number, required: true, min: 0, max: 696969420 },
  timeRemaining: { type: Number, required: true },
  isAssessment: { type: Boolean, required: true },
  priority: { type: Number, min: 0 },
  _blocks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block'
    }
  ]
});

module.exports = {
  name: 'Assignment',
  schema
};
