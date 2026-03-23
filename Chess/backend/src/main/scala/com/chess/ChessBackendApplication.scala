package com.chess

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.Bean
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.chess.services.ChessEngine

@SpringBootApplication
class ChessBackendApplication {
  
  @Bean
  def scalaModule(): DefaultScalaModule = {
    DefaultScalaModule
  }
}

object ChessBackendApplication {
  def main(args: Array[String]): Unit = {
    SpringApplication.run(classOf[ChessBackendApplication], args: _*)
  }
}
