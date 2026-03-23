package com.chess.services

import com.chess.models._
import PieceColor._
import org.springframework.stereotype.Service

@Service
class ChessEngine {
  
  /**
    * Checks if a move is legal for the current board state
    */
  def isLegalMove(move: Move, board: Board, currentColor: PieceColor.Value): Boolean = {
    val piece = board.getPiece(move.from)
    
    // Must be moving a piece that exists
    if (piece.isEmpty) return false
    
    // Must be moving your own piece
    if (piece.get.color != currentColor) return false
    
    // Destination can't have your own piece
    if (board.isOccupiedBy(move.to, currentColor)) return false
    
    // Piece-specific move validation
    val isMoveLegal = piece.get match {
      case _: Pawn => isPawnMoveLegal(move, board, currentColor)
      case _: Rook => isRookMoveLegal(move, board)
      case _: Knight => isKnightMoveLegal(move, board)
      case _: Bishop => isBishopMoveLegal(move, board)
      case _: Queen => isQueenMoveLegal(move, board)
      case _: King => isKingMoveLegal(move, board)
    }
    
    if (!isMoveLegal) return false
    
    // Move must not leave king in check
    val tempBoard = board.movePiece(move.from, move.to)
    !isInCheck(currentColor, tempBoard)
  }
  
  /**
    * Get all possible legal moves for a color
    */
  def getLegalMoves(board: Board, color: PieceColor.Value): List[Move] = {
    val moves = scala.collection.mutable.ListBuffer[Move]()
    
    for ((square, piece) <- board.squares if piece.color == color) {
      for (targetSquare <- getAllSquares) {
        val move = Move(square, targetSquare)
        if (isLegalMove(move, board, color)) {
          moves += move
        }
      }
    }
    
    moves.toList
  }
  
  // ========== Pawn Logic ==========
  private def isPawnMoveLegal(move: Move, board: Board, color: PieceColor.Value): Boolean = {
    val direction = if (color == WHITE) 1 else -1
    val startRank = if (color == WHITE) 1 else 6
    
    // Forward move
    if (move.from.file == move.to.file) {
      val oneSquareForward = Square(move.from.file, move.from.rank + direction)
      
      // One square forward
      if (move.to == oneSquareForward) {
        return board.isEmpty(move.to)
      }
      
      // Two squares forward from starting position
      if (move.from.rank == startRank) {
        val twoSquaresForward = Square(move.from.file, move.from.rank + 2 * direction)
        if (move.to == twoSquaresForward) {
          val oneSquareCheck = Square(move.from.file, move.from.rank + direction)
          return board.isEmpty(oneSquareCheck) && board.isEmpty(move.to)
        }
      }
      
      return false
    }
    
    // Diagonal capture
    if (Math.abs(move.from.file - move.to.file) == 1 && move.to.rank == move.from.rank + direction) {
      return board.isOpponentPiece(move.to, color)
    }
    
    false
  }
  
  // ========== Rook Logic ==========
  private def isRookMoveLegal(move: Move, board: Board): Boolean = {
    if (move.from.file != move.to.file && move.from.rank != move.to.rank) {
      return false
    }
    isPathClear(move, board)
  }
  
  // ========== Knight Logic ==========
  private def isKnightMoveLegal(move: Move, board: Board): Boolean = {
    val fileDiff = Math.abs(move.from.file - move.to.file)
    val rankDiff = Math.abs(move.from.rank - move.to.rank)
    
    (fileDiff == 2 && rankDiff == 1) || (fileDiff == 1 && rankDiff == 2)
  }
  
  // ========== Bishop Logic ==========
  private def isBishopMoveLegal(move: Move, board: Board): Boolean = {
    val fileDiff = Math.abs(move.from.file - move.to.file)
    val rankDiff = Math.abs(move.from.rank - move.to.rank)
    
    if (fileDiff != rankDiff) return false
    isPathClear(move, board)
  }
  
  // ========== Queen Logic ==========
  private def isQueenMoveLegal(move: Move, board: Board): Boolean = {
    isRookMoveLegal(move, board) || isBishopMoveLegal(move, board)
  }
  
  // ========== King Logic ==========
  private def isKingMoveLegal(move: Move, board: Board): Boolean = {
    val fileDiff = Math.abs(move.from.file - move.to.file)
    val rankDiff = Math.abs(move.from.rank - move.to.rank)
    
    if (fileDiff > 1 || rankDiff > 1) return false
    
    // Check if destination is under attack (simplified check)
    true
  }
  
  // ========== Helper Methods ==========
  private def isPathClear(move: Move, board: Board): Boolean = {
    val fileDiff = Integer.signum(move.to.file - move.from.file)
    val rankDiff = Integer.signum(move.to.rank - move.from.rank)
    
    var currentFile = move.from.file + fileDiff
    var currentRank = move.from.rank + rankDiff
    
    while (currentFile != move.to.file || currentRank != move.to.rank) {
      if (board.squares.contains(Square(currentFile, currentRank))) {
        return false
      }
      currentFile += fileDiff
      currentRank += rankDiff
    }
    
    true
  }
  
  /**
    * Check if a color's king is in check
    */
  def isInCheck(color: PieceColor.Value, board: Board): Boolean = {
    val kingSquareOpt = board.findKing(color)
    
    kingSquareOpt.exists { kingSquare =>
      val opponentColor = if (color == WHITE) BLACK else WHITE
      
      // Check if any opponent piece can attack the king
      board.squares.exists {
        case (square, piece) if piece.color == opponentColor =>
          val move = Move(square, kingSquare)
          canAttack(move, board)
        case _ => false
      }
    }
  }
  
  /**
    * Check if a move can attack (used for check detection)
    * Similar to isLegalMove but doesn't check for check
    */
  private def canAttack(move: Move, board: Board): Boolean = {
    val piece = board.getPiece(move.from)
    
    if (piece.isEmpty) return false
    if (board.isOccupiedBy(move.to, piece.get.color)) return false
    
    piece.get match {
      case _: Pawn => 
        val direction = if (piece.get.color == WHITE) 1 else -1
        Math.abs(move.from.file - move.to.file) == 1 && move.to.rank == move.from.rank + direction
      case _: Rook => isRookMoveLegal(move, board)
      case _: Knight => isKnightMoveLegal(move, board)
      case _: Bishop => isBishopMoveLegal(move, board)
      case _: Queen => isQueenMoveLegal(move, board)
      case _: King => isKingMoveLegal(move, board)
    }
  }
  
  /**
    * Check if a color is in checkmate
    */
  def isCheckmate(color: PieceColor.Value, board: Board, moveHistory: List[Move]): Boolean = {
    if (!isInCheck(color, board)) return false
    getLegalMoves(board, color).isEmpty
  }
  
  /**
    * Check if a color is in stalemate
    */
  def isStalemate(color: PieceColor.Value, board: Board): Boolean = {
    if (isInCheck(color, board)) return false
    getLegalMoves(board, color).isEmpty
  }
  
  private def getAllSquares: List[Square] = {
    (for {
      file <- 0 until 8
      rank <- 0 until 8
    } yield Square(file, rank)).toList
  }
}
