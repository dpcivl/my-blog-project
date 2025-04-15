const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const GuestbookMessage = require('../models/GuestbookMessage');

// 🔹 일반 사용자용: 표시되는 메시지만 조회
router.get('/', async (req, res) => {
  const messages = await GuestbookMessage.find({ hidden: false })
    .select('-password')
    .sort({ date: -1 });

  res.json(messages);
});

// 🔹 전체 메시지 조회 (관리자용)
router.get('/all', async (req, res) => {
  const messages = await GuestbookMessage.find().sort({ date: -1 });
  console.log("Fetched all messages:", messages);
  res.json(messages);
});

// 🔹 메시지 작성
router.post('/', async (req, res) => {
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

// 🔹 메시지 삭제 (관리자 또는 비밀번호 입력 사용자)
router.delete('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const password = req.body?.password;

    const message = await GuestbookMessage.findById(id);
    if (!message) return res.status(404).json({ message: 'Not found' });

    // ✅ 관리자 삭제 (비밀번호 없음)
    if (!password) {
      await GuestbookMessage.findByIdAndDelete(id);
      return res.json({ message: 'Deleted by admin' });
    }

    // ✅ 사용자 비밀번호 인증 후 삭제
    const match = await bcrypt.compare(password, message.password);
    if (!match) return res.status(401).json({ message: 'Wrong password' });

    await GuestbookMessage.findByIdAndDelete(id);
    return res.json({ message: 'Deleted by guest' });

  } catch (err) {
    console.error('❌ Deletion failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 🔹 메시지 숨기기 (관리자)
router.post('/hide/:id', async (req, res) => {
  await GuestbookMessage.findByIdAndUpdate(req.params.id, { hidden: true });
  res.json({ message: "Message hidden" });
});

// 🔹 메시지 다시 보이기 (관리자)
router.post('/unhide/:id', async (req, res) => {
  await GuestbookMessage.findByIdAndUpdate(req.params.id, { hidden: false });
  res.json({ message: "Message unhidden" });
});

module.exports = router;