const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

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

router.delete('/:id', async (req, res) => {
  const { password } = req.body;
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  if (comment.password !== password) {
    return res.status(401).json({ message: 'Wrong password' });
  }

  await Comment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Comment deleted' });
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