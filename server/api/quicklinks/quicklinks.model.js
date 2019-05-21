const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    confirmed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

schema.set('toObject', { getters: true, virtuals: true });
schema.set('toJSON', { getters: true, virtuals: true });

module.exports = mongoose.model('QuickLink', schema);
