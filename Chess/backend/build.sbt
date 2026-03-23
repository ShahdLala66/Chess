ThisBuild / version := "0.1.0-SNAPSHOT"
ThisBuild / organization := "com.chess"
ThisBuild / scalaVersion := "2.13.12"

lazy val root = (project in file("."))
  .settings(
    name := "chess-backend",
    // Keep the server running during sbt run
    run / fork := true,
    run / javaOptions := Seq(
      "-Dspring.jpa.hibernate.ddl-auto=update",
      "-Dspring.data.mongodb.auto-index-creation=true"
    ),
    libraryDependencies ++= Seq(
      // Spring Boot Core
      "org.springframework.boot" % "spring-boot-starter-web" % "3.1.5",
      "org.springframework.boot" % "spring-boot-starter-data-mongodb" % "3.1.5",
      "org.springframework.boot" % "spring-boot-starter-websocket" % "3.1.5",
      
      // Scala integration with Spring Boot
      "org.scala-lang" % "scala-library" % "2.13.12",
      
      // JSON serialization
      "com.fasterxml.jackson.module" %% "jackson-module-scala" % "2.15.2",
      "com.fasterxml.jackson.datatype" % "jackson-datatype-jsr310" % "2.15.2",
      
      // MongoDB driver
      "org.mongodb" % "mongodb-driver-sync" % "4.10.2",
      
      // Logging
      "org.springframework.boot" % "spring-boot-starter-logging" % "3.1.5",
      "org.slf4j" % "slf4j-api" % "2.0.9",
      
      // Testing
      "org.springframework.boot" % "spring-boot-starter-test" % "3.1.5" % Test,
      "org.scalatest" %% "scalatest" % "3.2.17" % Test,
      "org.mockito" %% "mockito-scala" % "1.17.29" % Test
    ),
    // Exclude scala-xml from scalatra to avoid conflicts
    excludeDependencies ++= Seq(
      ExclusionRule("org.scala-lang.modules", "scala-xml_2.13")
    )
  )
