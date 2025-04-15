require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const admin = require("firebase-admin");

const app = express();
const PORT = 3000;

// 🔹 Firebase Admin 초기화
const serviceAccountBase64 = process.env.FIREBASE_CREDENTIALS_BASE64;
const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountBase64, "base64").toString("utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://hyoinparkblog.firebasestorage.app"
});
const bucket = admin.storage().bucket();

// 🔹 MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 🔹 미들웨어
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// 🔹 multer 설정 (공용으로 쓰기 위해 index에도 유지)
const upload = multer({
  dest: path.join(__dirname, 'uploads')
});

// 🔹 Firebase Storage 이미지 업로드 전용
app.post('/upload-image', upload.single('image'), async (req, res) => {
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
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media&token=${token}`;

  fs.unlinkSync(req.file.path); // cleanup
  res.json({ url });
});

// 🔹 관리자 로그인
app.post('/admin/login', (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false });
  }
});

// 🔹 라우터 등록
const postRoutes = require('./routes/post');
const guestbookRoutes = require('./routes/guestbook');
const commentRoutes = require('./routes/comment');

app.use('/posts', postRoutes);
app.use('/guestbook', guestbookRoutes);
app.use('/comments', commentRoutes);

// 🔹 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Blog backend running at http://localhost:${PORT}`);
});
