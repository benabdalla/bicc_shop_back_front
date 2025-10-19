# ====================== BUILD STAGE ======================
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies with retry and timeout settings
COPY pom.xml .
RUN mvn dependency:resolve -B \
    -Dmaven.wagon.http.ssl.insecure=true \
    -Dmaven.wagon.http.ssl.allowall=true \
    -Dmaven.wagon.http.ssl.ignore.validity.dates=true

COPY src ./src
RUN mvn package -DskipTests -B

# ====================== RUNTIME STAGE ======================
FROM eclipse-temurin:17-jre

# Install fonts and graphics libraries needed for JasperReports
RUN apt-get update && apt-get install -y \
    fontconfig \
    libfreetype6 \
    fonts-dejavu \
    fonts-dejavu-core \
    fonts-dejavu-extra \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the JAR file
COPY --from=build /app/target/*.jar app.jar

# Copy JasperReports templates and resources
COPY --from=build /app/src/main/resources/jasper/ /app/jasper/

# Create reports output directory
RUN mkdir -p /app/reports

# Set JVM options for better font handling and JasperReports
ENV JAVA_OPTS="-Djava.awt.headless=true -Dfile.encoding=UTF-8"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
