const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  // Fall 2018
  title: { type: String, required: true },
  code: { type: String, minlength: 6, maxlength: 6, required: true }, // 201809
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

module.exports = {
  name: 'Block',
  schema
};
