# 기본 Nginx 이미지 사용
FROM nginx:latest

# Nginx 설정 파일을 컨테이너로 복사
COPY nginx.conf /etc/nginx/nginx.conf

# (선택 사항) 필요한 웹 파일도 복사
COPY index.html  /usr/share/nginx/html/index.html
COPY main.html  /usr/share/nginx/html/main.html

# Nginx 서비스 실행
CMD ["nginx", "-g", "daemon off;"]

