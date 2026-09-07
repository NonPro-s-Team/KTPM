# ===== Stage 1: Build =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy trước pom.xml để tận dụng cache layer khi dependencies không đổi
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy toàn bộ source code
COPY src ./src
RUN mvn clean package -DskipTests -B

# ===== Stage 2: Run =====
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy file jar đã build
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8081

# Chạy với profile mặc định (application.yml gốc) — đọc biến môi trường ${...}
# do docker-compose truyền vào qua .env, KHÔNG dùng application-local.yml
ENTRYPOINT ["java", "-jar", "app.jar"]