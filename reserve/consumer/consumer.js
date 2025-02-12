require('dotenv').config();  // .env 파일 로드

const { ServiceBusClient } = require("@azure/service-bus");
const mysql = require("mysql2/promise");

// 환경 변수에서 정보 로드
const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
const requestQueue = process.env.REQUEST_QUEUE; // 예약 요청 큐

// MySQL DB 연결 설정
const dbClient = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// 예약 가능 여부 확인 함수
async function checkAvailability(doctorId, appointmentTime) {
  const query = "SELECT * FROM reservations WHERE doctor_id = ? AND appointment_time = ?";
  const values = [doctorId, appointmentTime];
  try {
    const [rows] = await dbClient.query(query, values);
    return rows.length === 0; // 예약이 없으면 true (가능), 있으면 false (불가능)
  } catch (err) {
    console.error("Error checking availability:", err.stack);
    return false; // 에러 발생 시 예약 불가 처리
  }
}

async function processReservations() {
  const sbClient = new ServiceBusClient(connectionString);
  const receiver = sbClient.createReceiver(requestQueue, { receiveMode: "peekLock" });

  console.log("[✔] Waiting for reservation requests...");

  while (true) {
    try {
      // 여러 메시지를 한 번에 받기 (최대 10개 메시지)
      const messages = await receiver.receiveMessages(10, { maxWaitTimeInMs: 100 });

      if (messages.length === 0) {
        continue;
      }

      // 메시지 처리
      for (const message of messages) {
        const jsonObject = JSON.parse(message.body);

        const { doctorId, patientId, appointmentTime, description } = jsonObject;

        const isAvailable = await checkAvailability(doctorId, appointmentTime);

        if (isAvailable) {
          // 예약이 가능하면 데이터베이스에 저장
          await dbClient.query(
            "INSERT INTO reservations (doctor_id, patient_id, appointment_time, description) VALUES (?, ?, ?, ?)",
            [doctorId, patientId, appointmentTime, description]
          );
          console.log(`예약 성공 - 환자 ID: ${patientId}, 의사: ${doctorId}, 시간: ${appointmentTime}`);

        } else {
          console.log(`예약 실패 - 의사: ${doctorId}, 시간: ${appointmentTime}`);
        }
        // 메시지 완료 처리
        await receiver.completeMessage(message);
      }
    } catch (error) {
      console.error("Error processing reservation:", error);
    }
  }
}

// 예약 처리 시작
processReservations().catch((err) => {
  console.error("Error processing reservations:", err.stack);
});

