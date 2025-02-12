require('dotenv').config(); // 환경 변수 로드

const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs'); // 비밀번호 암호화를 위한 라이브러리
const app = express();
const port = 3000;

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// 미들웨어 설정
app.use(express.json());

// 로그인 엔드포인트
app.post('/login', (req, res) => {
  console.log('📩 로그인 요청 수신:', req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    console.error('❌ 입력값 부족');
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
  }

  // ✅ MySQL 연결 풀에서 연결 가져오기
  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ MySQL 연결 오류:', err);
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    // 이메일이 존재하는지 확인
    connection.query('SELECT * FROM signup WHERE Email = ?', [email], (err, result) => {
      connection.release(); // ✅ 사용한 연결 해제

      if (err) {
        console.error('❌ DB 조회 오류:', err);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }

      if (result.length === 0) {
        console.warn(`⚠️ 로그인 실패: 이메일 없음 (${email})`);
        return res.status(404).json({ message: '이메일에 해당하는 사용자가 없습니다.' });
      }

      const user = result[0];

      // 패스워드가 일치하는지 확인
      bcrypt.compare(password, user.Password, (err, isMatch) => {
        if (err) {
          console.error('❌ 비밀번호 비교 오류:', err);
          return res.status(500).json({ message: '비밀번호 비교 중 오류가 발생했습니다.' });
        }

        if (!isMatch) {
          console.warn(`⚠️ 로그인 실패: 비밀번호 불일치 (${email})`);
          return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        console.log(`✅ 로그인 성공: ${email}`);

        // 로그인 성공 시 유저 정보와 함께 유저 ID도 응답으로 넘김
        return res.status(200).json({
          message: '로그인 성공',
          userId: user.id,
          user: {
            id: user.id,
            email: user.Email
          }
        });
      });
    });
  });
});

// 회원가입 요청 처리
app.post('/signup', (req, res) => {
  console.log('📩 회원가입 요청 수신:', req.body);

  const { name, email, password, idnum, address } = req.body;

  if (!name || !email || !password || !idnum || !address) {
    console.error('❌ 입력값 부족');
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  const query = `INSERT INTO signup (Username, Email, Password, idnum, address) VALUES (?, ?, ?, ?, ?)`;

  // ✅ MySQL 연결 풀에서 연결 가져오기
  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ MySQL 연결 오류:', err);
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error('❌ 비밀번호 암호화 오류:', err);
        connection.release();
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }

      console.log('🔑 암호화된 비밀번호:', hashedPassword);

      // ✅ 쿼리 실행 후 연결 해제
      connection.query(query, [name, email, hashedPassword, idnum, address], (err, results) => {
        connection.release(); // ✅ 사용한 연결 해제

        if (err) {
          console.error('❌ DB 오류:', err);
          return res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
        }

        console.log('✅ 회원가입 성공:', results);
        res.status(200).json({ message: '회원가입 성공!' });
      });
    });
  });
});


// 서버 시작
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});

