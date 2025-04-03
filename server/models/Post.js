const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    image: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);