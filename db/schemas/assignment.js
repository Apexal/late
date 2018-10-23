const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  _student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 4000 },
  dueDate: { type: Date, required: true },
  courseCRN: { type: String, required: true }, // CRN
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

module.exports = {
  name: 'Assignment',
  schema
};
