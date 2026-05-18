# Stages can be targeted individually by name e.g. docker build --target build-client
FROM maven:eclipse-temurin AS build-server
WORKDIR /app

# Set up dependencies for caching first
COPY server/pom.xml .
COPY server/mvnw .
COPY server/.mvn .mvn
RUN chmod +x mvnw && ./mvnw -DskipTests dependency:go-offline

# Copy source and build
COPY server/src src
RUN ./mvnw -DskipTests clean package

# Based on https://pnpm.io/docker#example-3-build-on-cicd
FROM node:lts-slim AS build-client

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY client/pnpm-lock.yaml .
# Fetch is an optimized command for docker build to support caching. --prod is used to avoid installing devDependencies
RUN pnpm fetch --prod

COPY client/ .
RUN pnpm build

FROM eclipse-temurin:25.0.2_10-jre-noble AS final
WORKDIR /app
COPY --from=build-server /app/target/*.jar app.jar
# Copy the client files and put them in /public to be exposed by spring boot
COPY --from=build-client /app/dist /app/public

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
