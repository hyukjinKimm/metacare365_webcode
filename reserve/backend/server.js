require('dotenv').config();  // .env 파일을 로드

const express = require('express');
const cors = require("cors");
const { ServiceBusClient } = require('@azure/service-bus');
const { ServiceBusManagementClient } = require('@azure/arm-servicebus');
const { ClientSecretCredential } = require('@azure/identity');
const uuid = require('uuid');

// 환경 변수에서 정보 로드
const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
const requestQueue = process.env.REQUEST_QUEUE;

const app = express();
app.use(express.json());

// 특정 도메인만 허용
const allowedOrigins = ["https://www.metacare365.shop", "https://metacare365.shop"];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.options("*", cors()); // Preflight 요청 허용
const sbClient = new ServiceBusClient(connectionString);
const sender = sbClient.createSender(requestQueue);

const credential = new ClientSecretCredential(
  process.env.TENANT_ID,  // tenantId
  process.env.CLIENT_ID,  // clientId
  process.env.CLIENT_SECRET  // clientSecret
);

const subscriptionId = process.env.SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const namespaceName = process.env.NAMESPACE_NAME;
const serviceBusClient = new ServiceBusManagementClient(credential, subscriptionId);

async function createQueueIfNotExists(queueName) {
  try {
    console.log(`[INFO] 큐 "${queueName}"가 존재하는지 확인 중...`);
    const queues = [];
    for await (const queue of serviceBusClient.queues.listByNamespace(resourceGroupName, namespaceName)) {
      queues.push(queue);
    }

    const queueExists = queues.some(queue => queue.name === queueName);
    if (!queueExists) {
      console.log(`[INFO] 큐 "${queueName}" 생성 중...`);
      await serviceBusClient.queues.createOrUpdate(resourceGroupName, namespaceName, queueName, {});
      console.log(`[INFO] 큐 "${queueName}"가 성공적으로 생성되었습니다.`);
    } else {
      console.log(`[INFO] 큐 "${queueName}"는 이미 존재합니다.`);
    }
  } catch (error) {
    console.error(`[ERROR] 큐 생성 또는 확인 중 오류 발생:`, error);
  }
}

app.post('/', async (req, res) => {
  const { doctorId, patientId, appointmentTime, description } = req.body;

  if (!doctorId || !patientId || !appointmentTime) {
    return res.status(400).json({ error: '필수 필드가 누락되었습니다' });
  }

  try {
    await sender.sendMessages({
      body: JSON.stringify(req.body),
    });
    res.status(200).json({ message: "에약 요청 성공" });
  } catch (error) {
    console.error('[ERROR] 예약 프로세스 중 오류 발생:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

const port = 3000;
async function ensureQueuesExist() {
  console.log("[INFO] 필요한 큐들이 존재하는지 확인하고 생성 중...");
  await createQueueIfNotExists(requestQueue);
  console.log("[INFO] 모든 큐가 설정되었습니다.");
}

ensureQueuesExist().then(() => {
  app.listen(port, () => {
    console.log(`[INFO] 서버가 http://localhost:${port}에서 실행 중입니다.`);
  });
}).catch(error => {
  console.error("[ERROR] 큐 설정 중 오류 발생:", error);
});

