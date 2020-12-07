const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  _id: { type: String, required: true },
  originUrl: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = URL = mongoose.model('URL', urlSchema);