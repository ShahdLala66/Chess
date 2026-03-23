package com.chess.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class CorsConfig extends WebMvcConfigurer {
  
  override def addCorsMappings(registry: CorsRegistry): Unit = {
    registry
      .addMapping("/api/**")
      .allowedOrigins("http://localhost:4200", "http://localhost:3000")
      .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
      .allowedHeaders("*")
      .allowCredentials(true)
      .maxAge(3600)
  }
}
