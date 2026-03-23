package com.chess.services

import com.chess.models._
import java.util.UUID
import org.springframework.stereotype.Service

@Service
class GameService(chessEngine: ChessEngine) {
  
  // In-memory game storage (will be replaced with MongoDB later)
  private var games: Map[String, Game] = Map()
  
  /**
    * Create a new game between two players
    */
  def createGame(player1Id: String, player2Id: String): Game = {
    val gameId = UUID.randomUUID().toString
    val game = Game(
      gameId = gameId,
      player1Id = player1Id,  // WHITE
      player2Id = player2Id   // BLACK
    )
    games = games + (gameId -> game)
    game
  }
  
  /**
    * Get a game by ID
    */
  def getGame(gameId: String): Option[Game] = {
    games.get(gameId)
  }
  
  /**
    * Make a move in a game
    */
  def makeMove(gameId: String, move: Move, playerId: String): Either[String, Game] = {
    getGame(gameId) match {
      case None => Left(s"Game $gameId not found")
      case Some(game) =>
        // Verify it's the player's turn
        if (game.getCurrentPlayerId != playerId) {
          return Left("It's not your turn")
        }
        
        // Verify game is active
        if (game.status != GameStatus.ACTIVE) {
          return Left(s"Game is not active: ${game.status}")
        }
        
        // Validate the move is legal
        if (!chessEngine.isLegalMove(move, game.board, game.currentTurn)) {
          return Left(s"Invalid move: ${move.toAlgebraic}")
        }
        
        // Apply the move
        var updatedGame = game.applyMove(move)
        
        // Check for checkmate or stalemate
        val opponentColor = if (updatedGame.currentTurn == PieceColor.WHITE) PieceColor.WHITE else PieceColor.BLACK
        
        if (chessEngine.isCheckmate(updatedGame.currentTurn, updatedGame.board, updatedGame.moveHistory)) {
          updatedGame = updatedGame.makeCheckmate
        } else if (chessEngine.isStalemate(updatedGame.currentTurn, updatedGame.board)) {
          updatedGame = updatedGame.makeStalemate
        }
        
        // Update game in storage
        games = games + (gameId -> updatedGame)
        
        Right(updatedGame)
    }
  }
  
  /**
    * Get legal moves for a position
    */
  def getLegalMoves(gameId: String, playerId: String): Either[String, List[Move]] = {
    getGame(gameId) match {
      case None => Left(s"Game $gameId not found")
      case Some(game) =>
        if (game.getCurrentPlayerId != playerId) {
          return Left("It's not your turn")
        }
        Right(chessEngine.getLegalMoves(game.board, game.currentTurn))
    }
  }
  
  /**
    * Resign a game
    */
  def resignGame(gameId: String, playerId: String): Either[String, Game] = {
    getGame(gameId) match {
      case None => Left(s"Game $gameId not found")
      case Some(game) =>
        if (game.player1Id != playerId && game.player2Id != playerId) {
          return Left("Player not in this game")
        }
        val updatedGame = game.resignGame(playerId)
        games = games + (gameId -> updatedGame)
        Right(updatedGame)
    }
  }
  
  /**
    * Get all games (for debugging)
    */
  def getAllGames: List[Game] = games.values.toList
}
