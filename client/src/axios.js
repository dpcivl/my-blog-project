import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://my-blog-project-2485.onrender.com', // ← 당신의 백엔드 주소로 바꿔주세요
});

export default instance;