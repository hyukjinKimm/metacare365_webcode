# Node.js 이미지 사용
FROM node:18


# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 패키지 설치
COPY package*.json ./
RUN npm install

# 애플리케이션 소스 코드 복사
COPY . .

# 서버 포트 설정
EXPOSE 3000

# 서버 실행
CMD ["npm", "start"]

