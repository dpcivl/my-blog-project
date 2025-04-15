const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const bcrypt = require('bcrypt');

router.get('/:postId', async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.find({ postId }).sort({ date: -1 });
  res.json(comments);
});

router.post('/', async (req, res) => {
  const { postId, name, password, content } = req.body;

  // ✅ 스팸 방지 조건
  if (!content || content.length < 5) {
    return res.status(400).json({ message: '댓글은 최소 5자 이상이어야 합니다.' });
  }

  // 너무 빠르게 반복적으로 같은 댓글 → 여기서는 생략 가능 (captcha 등으로 대체 가능)

  const comment = new Comment({ postId, name, password, content });
  await comment.save();
  res.json({ success: true });
});

router.post('/delete/:id', async (req, res) => {
  const { password, isAdmin } = req.body;

  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  if (isAdmin === true) {
    await Comment.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Deleted by admin' });
  }

  const bcrypt = require('bcrypt');
  const match = await bcrypt.compare(password, comment.password);
  if (!match) return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

  await Comment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted by user' });
});

router.put('/:id', async (req, res) => {
  const { password, content } = req.body;
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  if (comment.password !== password) {
    return res.status(401).json({ message: 'Wrong password' });
  }

  comment.content = content;
  await comment.save();
  res.json({ message: 'Comment updated' });
});

module.exports = router;