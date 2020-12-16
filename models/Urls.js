const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  hashId: {type: String, require: true, index: true},
  originUrl: { type: String, required: true },
  createAt: { type: Date, expires: 60 * 60 * 24 * 30, default: Date.now } // Expire after a mounth
});

module.exports = URL = mongoose.model('URL', urlSchema);