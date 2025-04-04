require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const Post = require('./models/Post');
const GuestbookMessage = require('./models/GuestbookMessage');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const upload = multer({
    dest: path.join(__dirname, 'uploads')
});
const app = express();
const bcrypt = require('bcrypt');
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const POST_FILE = './posts.json';

// // Ensure post file exists
// fs.ensureFileSync(POST_FILE);
// fs.writeJsonSync(POST_FILE, [], { spaces: 2 });
// fs.ensureFileSync(GUESTBOOK_FILE);
// fs.writeJsonSync(GUESTBOOK_FILE, [], { spaces: 2 });

app.post('/admin/login', (req, res) => {
    if (req.body.password === process.env.ADMIN_PASSWORD) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false });
    }
  });

app.get('/posts', async (req, res) => {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  });
  
app.post('/posts', upload.single('image'), async (req, res) => {
    const newPost = new Post({
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        image: req.file ? req.file.filename : null
    });

    await newPost.save();
    res.json({ message: "Post created!", post: newPost });
});

app.get('/posts/:id', async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ error: "Not found" });
      res.json(post);
    } catch (err) {
      res.status(400).json({ error: "Invalid ID format" });
    }
  });

app.listen(PORT, () => {
    console.log(`Blog backend running on http://localhost:${PORT}`);
});

app.delete('/posts/:id', async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
});

app.put('/posts/:id', upload.single('image'), async (req, res) => {
    const update = {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        // No date change
    };

    if (req.file) {
        update.image = req.file.filename;
    }

    const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ message: "Post updated", post });
});

app.get('/guestbook', async (req, res) => {
    const messages = await GuestbookMessage.find({ hidden: false })
      .select('-password') // 👈 exclude password field
      .sort({ date: -1 });
  
    res.json(messages);
  });

app.post('/guestbook', async (req, res) => {
    const { name, message, password } = req.body;
  
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const newMsg = new GuestbookMessage({
      name,
      message,
      password: hashedPassword
    });
  
    await newMsg.save();
    res.json({ message: "Message posted" });
  });

// DELETE (Guest deletes permanently)
app.delete('/guestbook/delete/:id', async (req, res) => {
    const { password } = req.body;
    const msg = await GuestbookMessage.findById(req.params.id);
  
    if (!msg) return res.status(404).json({ error: "Not found" });
  
    const isMatch = await bcrypt.compare(password, msg.password);
    if (!isMatch) {
      return res.status(403).json({ error: "Incorrect password" });
    }
  
    await GuestbookMessage.findByIdAndDelete(req.params.id);
    res.json({ message: "Permanently deleted" });
  });
  
// HIDE (Admin hides)
app.post('/guestbook/hide/:id', async (req, res) => {
    await GuestbookMessage.findByIdAndUpdate(req.params.id, { hidden: true });
    res.json({ message: "Message hidden" });
  });

  app.get('/guestbook/all', async (req, res) => {
    const messages = await GuestbookMessage.find().sort({ date: -1 });
    console.log("Fetched all messages:", messages);
    res.json(messages);
  });

app.post('/guestbook/unhide/:id', async (req, res) => {
    await GuestbookMessage.findByIdAndUpdate(req.params.id, { hidden: false });
    res.json({ message: "Message unhidden" });
  });