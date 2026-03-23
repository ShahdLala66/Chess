package com.chess.models

import java.time.LocalDateTime
import com.fasterxml.jackson.annotation.JsonIgnore

object GameStatus extends Enumeration {
  type GameStatus = Value
  val ACTIVE, CHECKMATE, STALEMATE, RESIGNED = Value
}

import GameStatus._

case class Game(
  gameId: String,
  player1Id: String,           // WHITE pieces
  player2Id: String,           // BLACK pieces
  board: Board = Board(),
  moveHistory: List[Move] = List(),
  currentTurn: PieceColor.Value = PieceColor.WHITE,
  status: GameStatus.Value = ACTIVE,
  createdAt: LocalDateTime = LocalDateTime.now(),
  updatedAt: LocalDateTime = LocalDateTime.now()
) {
  
  @JsonIgnore
  def isWhitesTurn: Boolean = currentTurn == PieceColor.WHITE
  
  @JsonIgnore
  def isBlacksTurn: Boolean = currentTurn == PieceColor.BLACK
  
  @JsonIgnore
  def getCurrentPlayerId: String = if (isWhitesTurn) player1Id else player2Id
  
  def getOpponentId(playerId: String): Option[String] = {
    if (playerId == player1Id) Some(player2Id)
    else if (playerId == player2Id) Some(player1Id)
    else None
  }
  
  def applyMove(move: Move): Game = {
    // Update board with the move
    var newBoard = board.movePiece(move.from, move.to)
    
    // Handle pawn promotion
    move.promotion.foreach { promotionPiece =>
      val promotedPiece = promotionPiece match {
        case PieceType.QUEEN => Queen(currentTurn)
        case PieceType.ROOK => Rook(currentTurn)
        case PieceType.BISHOP => Bishop(currentTurn)
        case PieceType.KNIGHT => Knight(currentTurn)
        case _ => Queen(currentTurn) // default
      }
      newBoard = newBoard.setPiece(move.to, Some(promotedPiece))
    }
    
    val nextTurn = if (currentTurn == PieceColor.WHITE) PieceColor.BLACK else PieceColor.WHITE
    
    copy(
      board = newBoard,
      moveHistory = moveHistory :+ move,
      currentTurn = nextTurn,
      updatedAt = LocalDateTime.now()
    )
  }
  
  def resignGame(playerId: String): Game = {
    if (playerId == player1Id) {
      copy(status = RESIGNED, updatedAt = LocalDateTime.now())
    } else if (playerId == player2Id) {
      copy(status = RESIGNED, updatedAt = LocalDateTime.now())
    } else {
      this
    }
  }
  
  def makeCheckmate: Game = copy(status = CHECKMATE, updatedAt = LocalDateTime.now())
  
  def makeStalemate: Game = copy(status = STALEMATE, updatedAt = LocalDateTime.now())
}
