const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema(
  {
    _student: {
      // author of announcement (admin)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    title: { type: String, maxlength: 200, required: true }, // Required short title
    body: { type: String, maxlength: 4000, required: true }, // Markdown supported
    isPinned: { type: Boolean, default: false } // Whether or not the announcement shows up at the top of the page or just in the modal
  },
  { timestamps: true }
)

module.exports = mongoose.model('Announcement', schema)
