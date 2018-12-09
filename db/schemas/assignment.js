const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    title: { type: String, required: true, minlength: 3, maxlength: 200 },
    description: { type: String, maxlength: 4000 },
    dueDate: { type: Date, required: true },
    courseCRN: { type: String, required: true }, // CRN
    timeEstimate: { type: Number, required: true, min: 0, max: 696969420 },
    timeRemaining: { type: Number, required: true },
    isExam: { type: Boolean, required: true },
    priority: { type: Number, min: 0, max: 10 },
    comments: [
      {
        addedAt: { type: Date, required: true },
        body: { type: String, minlength: 1, maxlength: 2000, required: true }
      }
    ],
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    _blocks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Block'
      }
    ]
  },
  { timestamps: true }
);

schema.virtual('passed').get(function () {
  return moment(this.dueDate).isBefore(new Date());
});

module.exports = {
  name: 'Assignment',
  schema
};
