# 1. Node.js 공식 이미지를 사용하여 Node.js 환경 설정
FROM node:16

# 2. 작업 디렉토리를 /app으로 설정
WORKDIR /app

# 3. 로컬 파일들을 컨테이너의 /app 디렉토리로 복사
COPY package*.json ./

# 4. 프로젝트 의존성 설치
RUN npm install

# 5. 애플리케이션 소스 코드를 컨테이너에 복사
COPY . .

# 6. 애플리케이션 포트 노출 (기본적으로 3000번 포트 사용)
EXPOSE 3000

# 7. 애플리케이션 실행
CMD ["npm", "start"]

