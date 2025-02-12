require('dotenv').config(); // 환경 변수 로드

const express = require('express');
const cors = require("cors");
const mysql = require('mysql');
const bcrypt = require('bcryptjs'); // 비밀번호 암호화를 위한 라이브러리
const app = express();
const port = 3000;
// 특정 도메인만 허용
const allowedOrigins = ["https://www.metacare365.shop", "https://metacare365.shop"];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.options("*", cors()); // Preflight 요청 허용
// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// 미들웨어 설정
app.use(express.json());

// 로그인 엔드포인트
app.post('/', (req, res) => {
  const { email, password } = req.body;

  // 이메일이 존재하는지 확인
  db.query('SELECT * FROM signup WHERE Email = ?', [email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ message: '이메일에 해당하는 사용자가 없습니다.' });
    }

    const user = result[0];
    
    // 패스워드가 일치하는지 확인
    bcrypt.compare(password, user.Password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: '비밀번호 비교 중 오류가 발생했습니다.' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
      }

      // 로그인 성공 시 유저 정보와 함께 유저 ID도 응답으로 넘김
      return res.status(200).json({
        message: '로그인 성공',
        userId: user.id, // 유저 아이디를 응답에 포함
        user: user
      });
    });
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});

