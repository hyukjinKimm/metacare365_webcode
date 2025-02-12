# Node.js 공식 이미지를 베이스로 사용
FROM node:16

# 작업 디렉토리를 설정
WORKDIR /usr/src/app

# 로컬 프로젝트 파일을 컨테이너의 작업 디렉토리에 복사
COPY package*.json ./

# 필요한 Node.js 패키지들을 설치
RUN npm install

# 애플리케이션 소스 코드를 작업 디렉토리에 복사
COPY . .

# 애플리케이션이 3000 포트를 사용할 것이므로 해당 포트를 열어줌
EXPOSE 3000

# 서버를 시작하는 명령어
CMD ["node", "server.js"]

