const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    _student: {
      // author of announcement (admin)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isPinned: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', schema);
