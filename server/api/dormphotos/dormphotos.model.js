const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema(
  {
    _student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    imageURL: { type: String, required: true },
    dorm: { type: String, minlength: 3, maxlength: 100, required: true }, // the name of the building
    floor: { type: Number, min: 1, max: 10 }, // the floor number
    confirmed: { type: Boolean, default: false } // whether or not the photo has been confirmed by admins and can be displayed
  },
  { timestamps: true }
)

schema.set('toObject', { getters: true, virtuals: true })
schema.set('toJSON', { getters: true, virtuals: true })

module.exports = mongoose.model('DormPhoto', schema)
