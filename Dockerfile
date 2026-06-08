# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copy the API project files
COPY kamikatsu-api/pom.xml kamikatsu-api/
COPY kamikatsu-api/src kamikatsu-api/src
# Build the project
WORKDIR /app/kamikatsu-api
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/kamikatsu-api/target/*.jar app.jar

# Expose the API port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
