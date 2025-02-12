require('dotenv').config(); // 환경 변수 로드

const express = require('express');
const cors = require("cors");
const mysql = require('mysql');
const app = express();
const axios = require('axios')
const port = 3000;
// 특정 도메인만 허용
const allowedOrigins = ["https://www.metacare365.shop", "https://metacare365.shop"];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.options("*", cors()); // Preflight 요청 허용

// 미들웨어 설정
app.use(express.json());
// 로그인 엔드포인트
app.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 특정 IP의 /login 엔드포인트로 요청
    const response = await axios.post(`http://${process.env.ON_PREMISE_IP}:3000/login`, {
      email,
      password
    });

    // 요청 성공 시 클라이언트에게 응답 전달
    return res.status(200).json({
        message: '로그인 성공', 
        userId: response.data.user.id, 
        user: response.data.user
     });
  } catch (error) {
    // 요청 실패 (로그인 실패 또는 서버 문제)
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    } else {
      return res.status(500).json({ message: '로그인 요청 중 오류 발생' });
    }
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});

