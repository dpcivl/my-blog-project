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
const admin = require("firebase-admin");
// const serviceAccount = require("./firebase-key.json");
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // For unique filenames
const PORT = 3000;

const serviceAccountBase64 = process.env.FIREBASE_CREDENTIALS_BASE64;
const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountBase64, "base64").toString("utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://hyoinparkblog.firebasestorage.app"
});
const bucket = admin.storage().bucket();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

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
  let imageUrl = null;

  if (req.file) {
    const filename = `${uuidv4()}-${req.file.originalname}`;
    const upload = await bucket.upload(req.file.path, {
      destination: filename,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uuidv4()
        }
      }
    });

    const file = upload[0];
    const token = file.metadata.metadata.firebaseStorageDownloadTokens;
    imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media&token=${token}`;

    // remove local copy
    fs.unlinkSync(req.file.path);
  }

  const newPost = new Post({
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    image: imageUrl
  });

  await newPost.save();
  res.json({ message: "Post created!", post: newPost });
});

app.post('/upload-image', upload.single('image'), async (req, res) => {
  const filename = `${uuidv4()}-${req.file.originalname}`;
  const upload = await bucket.upload(req.file.path, {
    destination: filename,
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: uuidv4()
      }
    }
  });

  const file = upload[0];
  const token = file.metadata.metadata.firebaseStorageDownloadTokens;
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media&token=${token}`;

  fs.unlinkSync(req.file.path); // cleanup
  res.json({ url });
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
  };

  if (req.file) {
    const filename = `${uuidv4()}-${req.file.originalname}`;
    const upload = await bucket.upload(req.file.path, {
      destination: filename,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      },
    });

    const file = upload[0];
    const token = file.metadata.metadata.firebaseStorageDownloadTokens;
    update.image = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media&token=${token}`;

    fs.unlinkSync(req.file.path);
  } else {
    // 👇 Keep the existing image if not replaced
    const existing = await Post.findById(req.params.id);
    if (existing?.image) {
      update.image = existing.image;
    }
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
    try {
      const id = req.params.id;
      const password = req.body?.password;
  
      const message = await GuestbookMessage.findById(id);
      if (!message) return res.status(404).json({ message: 'Not found' });
  
      // ✅ Admin mode (no password)
      if (!password) {
        await GuestbookMessage.findByIdAndDelete(id);
        return res.json({ message: 'Deleted by admin' });
      }
  
      // ✅ Guest mode — verify password
      const match = await bcrypt.compare(password, message.password);
      if (!match) return res.status(401).json({ message: 'Wrong password' });
  
      await GuestbookMessage.findByIdAndDelete(id);
      return res.json({ message: 'Deleted by guest' });
  
    } catch (err) {
      console.error('❌ Deletion failed:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
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