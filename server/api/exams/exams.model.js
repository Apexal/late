const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const Block = require('../blocks/blocks.model');

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    title: { type: String, required: true, minlength: 3, maxlength: 200 },
    description: { type: String, maxlength: 4000 },
    date: { type: Date, required: true },
    courseCRN: { type: String, required: true }, // CRN
    timeEstimate: { type: Number, required: true, min: 0, max: 696969420 },
    timeRemaining: { type: Number, required: true },
    priority: { type: Number, min: 1, max: 3, default: 2 },
    comments: [
      {
        addedAt: { type: Date, required: true },
        body: { type: String, minlength: 1, maxlength: 2000, required: true }
      }
    ],
    _blocks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Block'
      }
    ]
  },
  { timestamps: true }
);

schema.set('toObject', { getters: true, virtuals: true });
schema.set('toJSON', { getters: true, virtuals: true });

schema.virtual('passed').get(function () {
  return moment(this.date).isBefore(new Date());
});

schema.pre('save', async function () {
  // Delete any work blocks that are passed the exam date now
  if (!this.isNew) {
    await Block.deleteMany({
      _student: this._student,
      _id: { $in: this._blocks },
      endTime: { $gte: this.date }
    });
  }
});

schema.pre('remove', async function () {
  // Delete any work blocks for this exam
  await Block.deleteMany({
    _student: this._student,
    _id: { $in: this._blocks }
  });
});

module.exports = mongoose.model('Exam', schema);
