const mongoose = require('mongoose');

const guestbookSchema = new mongoose.Schema({
  name: String,
  message: String,
  date: { type: Date, default: Date.now },
  hidden: { type: Boolean, default: false },
  password: String
});

module.exports = mongoose.model('GuestbookMessage', guestbookSchema);
