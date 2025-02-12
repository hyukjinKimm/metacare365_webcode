require('dotenv').config(); // 환경 변수 로드

const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
// 특정 도메인만 허용
const allowedOrigins = ["https://www.metacare365.shop", "https://metacare365.shop"];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.options("*", cors()); // Preflight 요청 허용


app.post('/', async (req, res) => {
  const { name, email, password, idnum, address } = req.body;
  
  // 입력값 유효성 검사
  if (!name || !email || !password || !idnum || !address) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  try {
    // 특정 IP의 /login 엔드포인트로 요청
    const response = await axios.post(`http://${process.env.ON_PREMISE_IP}/signup`, {
      name,
      email,
      password,
      idnum,
      address
    });
    res.status(200).json({ message: '회원가입 성공!' });

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
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});

