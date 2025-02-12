# 1. Node.js 이미지를 기반으로 시작
FROM node:16

# 2. 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3. 패키지 관련 파일을 컨테이너에 복사
COPY package*.json ./

# 4. 의존성 설치
RUN npm install

# 5. 나머지 애플리케이션 소스 파일 복사
COPY . .

# 6. 서버가 사용하는 포트 노출
EXPOSE 3000

# 7. 서버 시작
CMD ["npm", "start"]

