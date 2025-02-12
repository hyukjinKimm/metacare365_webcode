# Node.js 이미지 사용
FROM node:18

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 패키지 설치
COPY package*.json ./
RUN npm install

# 애플리케이션 소스 코드 복사
COPY . .

# 컨슈머 포트 설정 (컨슈머는 포트를 열지 않음, 단지 RabbitMQ와 연결됨)
# EXPOSE는 여기에 필요하지 않지만 나중에 다른 네트워크 구성을 위해 사용할 수 있음
# EXPOSE 5672

# 컨슈머 실행
CMD ["npm", "start"]




