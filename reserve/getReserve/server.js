require('dotenv').config();  // .env 파일을 로드

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require("cors");
const app = express();
app.use(express.json());
// 특정 도메인만 허용
const allowedOrigins = ["https://www.metacare365.shop"];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.options("*", cors()); // Preflight 요청 허용
// MySQL 연결 설정
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 예약 조회
app.get('/', async (req, res) => {
  const patientId = req.query.patientId;

  if (!patientId) {
    return res.status(400).json({ error: "patientId가 필요합니다." });
  }

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM reservations WHERE patient_id = ?",
      [patientId]
    );
    connection.release();

    res.status(200).json(rows);
  } catch (error) {
    console.error('[ERROR] 예약 조회 중 오류 발생:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`[INFO] 서버가 http://localhost:${port}에서 실행 중입니다.`);
});

