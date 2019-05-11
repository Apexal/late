const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const category = new Schema({
  title: { type: String, trim: true, minlength: 1, maxlength: 300, required: true },
  items: [{
    title: { type: String, trim: true, minlength: 1, maxlength: 300, required: true },
    count: { type: Number, required: true },
    progress: { type: Number, default: 0 }
  }],
  private: { type: Boolean, default: false }
});

const schema = new Schema(
  {
    _student: {
      // (optional) author of checklist
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    categories: [
      category
    ]
  },
  { timestamps: true }
);

// Does this checklist have a student owner or did a guest create it?
schema.virtual('isAnonymous').get(function () {
  return !this._student;
});


module.exports = mongoose.model('Checklist', schema);
