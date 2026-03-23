package com.chess.controllers

import com.chess.models._
import com.chess.services.{ChessEngine, GameService}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation._

@RestController
@RequestMapping(value = Array("/games"))
@CrossOrigin(
  origins = Array("http://localhost:4200", "http://localhost:3000"),
  allowCredentials = "true",
  maxAge = 3600,
  allowedHeaders = Array("*"),
  methods = Array(
    org.springframework.web.bind.annotation.RequestMethod.GET,
    org.springframework.web.bind.annotation.RequestMethod.POST,
    org.springframework.web.bind.annotation.RequestMethod.PUT,
    org.springframework.web.bind.annotation.RequestMethod.DELETE,
    org.springframework.web.bind.annotation.RequestMethod.OPTIONS
  )
)
class GameController(
  @Autowired chessEngine: ChessEngine,
  @Autowired gameService: GameService
) {
  
  /**
    * Create a new game
    */
  @PostMapping
  def createGame(@RequestBody request: CreateGameRequest): ResponseEntity[Game] = {
    val game = gameService.createGame(request.player1Id, request.player2Id)
    ResponseEntity.ok(game)
  }
  
  /**
    * Get a game by ID
    */
  @GetMapping(value = Array("/{gameId}"))
  def getGame(@PathVariable gameId: String): ResponseEntity[Any] = {
    gameService.getGame(gameId) match {
      case Some(game) => ResponseEntity.ok(game)
      case None => ResponseEntity.notFound().build()
    }
  }
  
  /**
    * Make a move in a game
    */
  @PostMapping(value = Array("/{gameId}/moves"))
  def makeMove(
    @PathVariable gameId: String,
    @RequestBody request: MakeMoveRequest
  ): ResponseEntity[Any] = {
    gameService.makeMove(gameId, request.move, request.playerId) match {
      case Right(game) => ResponseEntity.ok(game)
      case Left(error) => ResponseEntity.badRequest().body(Map("error" -> error))
    }
  }
  
  /**
    * Get legal moves for current position
    */
  @GetMapping(value = Array("/{gameId}/legal-moves"))
  def getLegalMoves(
    @PathVariable gameId: String,
    @RequestParam playerId: String
  ): ResponseEntity[Any] = {
    gameService.getLegalMoves(gameId, playerId) match {
      case Right(moves) => ResponseEntity.ok(moves)
      case Left(error) => ResponseEntity.badRequest().body(Map("error" -> error))
    }
  }
  
  /**
    * Resign from a game
    */
  @PostMapping(value = Array("/{gameId}/resign"))
  def resign(
    @PathVariable gameId: String,
    @RequestBody request: ResignRequest
  ): ResponseEntity[Any] = {
    gameService.resignGame(gameId, request.playerId) match {
      case Right(game) => ResponseEntity.ok(game)
      case Left(error) => ResponseEntity.badRequest().body(Map("error" -> error))
    }
  }
}

case class CreateGameRequest(player1Id: String, player2Id: String)
case class MakeMoveRequest(move: Move, playerId: String)
case class ResignRequest(playerId: String)
