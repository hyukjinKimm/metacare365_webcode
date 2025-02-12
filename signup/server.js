require('dotenv').config(); // 환경 변수 로드

const express = require('express');
const cors = require("cors");
const mysql = require('mysql2');
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

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});


// 데이터베이스 연결
db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 오류:', err);
    return;
  }
  console.log('MySQL에 연결되었습니다.');
});

// Body parser middleware 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 회원가입 요청 처리
app.post('/', (req, res) => {
  const { name, email, password, idnum, address } = req.body;

  // 입력값 유효성 검사
  if (!name || !email || !password || !idnum || !address) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  // SQL 쿼리 준비
  const query = `INSERT INTO signup (Username, Email, Password, idnum, address) VALUES (?, ?, ?, ?, ?)`;

  // 비밀번호 암호화 (비밀번호를 그대로 저장하는 것은 보안상 좋지 않음, bcrypt 등의 라이브러리로 암호화하는 것이 좋음)
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('비밀번호 암호화 오류:', err);
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    // 데이터베이스에 사용자 정보 삽입
    db.execute(query, [name, email, hashedPassword, idnum, address], (err, results) => {
      if (err) {
        console.error('DB 오류:', err);
        return res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
      }
      res.status(200).json({ message: '회원가입 성공!' });
    });
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});

