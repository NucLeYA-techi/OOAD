FROM maven:3-amazoncorretto AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -q dependency:go-offline

COPY . .
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 5000
ENTRYPOINT ["java", "-jar", "app.jar"]
