const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  name: String,
  password: String,
  content: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);