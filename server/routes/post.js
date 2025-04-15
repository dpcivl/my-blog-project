// routes/post.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Post = require('../models/Post');

// Firebase Storage 연동
const admin = require("firebase-admin");
const bucket = admin.storage().bucket();

// multer 설정
const upload = multer({
  dest: path.join(__dirname, '..', 'uploads') // uploads 폴더에 저장
});

// 🔹 모든 게시글 불러오기
router.get('/', async (req, res) => {
  const posts = await Post.find().sort({ date: -1 });
  res.json(posts);
});

// 🔹 특정 게시글 불러오기
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// 🔹 게시글 작성
router.post('/', upload.single('image'), async (req, res) => {
  let imageUrl = null;

  if (req.file) {
    const filename = `${uuidv4()}-${req.file.originalname}`;
    const uploadResult = await bucket.upload(req.file.path, {
      destination: filename,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uuidv4()
        }
      }
    });

    const file = uploadResult[0];
    const token = file.metadata.metadata.firebaseStorageDownloadTokens;
    imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media&token=${token}`;

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

// 🔹 게시글 수정
router.put('/:id', upload.single('image'), async (req, res) => {
  const update = {
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
  };

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  // 기존 이미지 삭제
  if (req.body.removeImage === 'true' && post.image) {
    try {
      const match = post.image.match(/\/o\/(.+)\?alt=media/);
      if (match) {
        const filePath = decodeURIComponent(match[1]);
        await bucket.file(filePath).delete();
        update.image = null;
      }
    } catch (err) {
      console.error('❌ Failed to delete old image:', err);
    }
  }

  // 새 이미지 업로드
  if (req.file) {
    const filename = `${uuidv4()}-${req.file.originalname}`;
    const uploadResult = await bucket.upload(req.file.path, {
      destination: filename,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uuidv4()
        }
      }
    });

    const file = uploadResult[0];
    const token = file.metadata.metadata.firebaseStorageDownloadTokens;
    update.image = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media&token=${token}`;

    fs.unlinkSync(req.file.path);
  }

  const updatedPost = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json({ message: "Post updated", post: updatedPost });
});

// 🔹 게시글 삭제
router.delete('/:id', async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});

module.exports = router;
