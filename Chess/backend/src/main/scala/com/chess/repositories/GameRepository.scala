package com.chess.repositories

import com.chess.models.Game
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

/**
  * MongoDB repository for Game persistence
  * Spring Data MongoDB will generate implementation automatically
  */
@Repository
trait GameRepository extends MongoRepository[Game, String] {
  
  // Custom query methods can be added here
  // Example: def findByPlayer1Id(player1Id: String): java.util.List[Game]
  // Example: def findByStatus(status: String): java.util.List[Game]
}
