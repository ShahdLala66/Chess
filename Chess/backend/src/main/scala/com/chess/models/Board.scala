package com.chess.models

case class Square(file: Int, rank: Int) {
  // file: 0-7 (a-h), rank: 0-7 (1-8)
  require(file >= 0 && file < 8, "file must be 0-7")
  require(rank >= 0 && rank < 8, "rank must be 0-7")
  
  def toAlgebraic: String = {
    val fileChar = ('a' + file).toChar
    val rankNum = (rank + 1).toString
    s"$fileChar$rankNum"
  }
  
  def distance(other: Square): Int = {
    Math.max(Math.abs(file - other.file), Math.abs(rank - other.rank))
  }
  
  def isOnBoard: Boolean = file >= 0 && file < 8 && rank >= 0 && rank < 8
}

object Square {
  def fromAlgebraic(algebraic: String): Option[Square] = {
    if (algebraic.length != 2) return None
    val file = algebraic.head - 'a'
    val rank = algebraic(1).asDigit - 1
    if (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
      Some(Square(file, rank))
    } else {
      None
    }
  }
}

case class Board(squares: Map[Square, Piece] = Board.initialPosition) {
  
  def getPiece(square: Square): Option[Piece] = squares.get(square)
  
  def setPiece(square: Square, piece: Option[Piece]): Board = {
    piece match {
      case Some(p) => Board(squares + (square -> p))
      case None => Board(squares - square)
    }
  }
  
  def movePiece(from: Square, to: Square): Board = {
    getPiece(from) match {
      case Some(piece) => Board(squares - from + (to -> piece))
      case None => this
    }
  }
  
  def isEmpty(square: Square): Boolean = !squares.contains(square)
  
  def isOccupiedBy(square: Square, color: PieceColor.Value): Boolean = {
    getPiece(square).exists(_.color == color)
  }
  
  def isOpponentPiece(square: Square, color: PieceColor.Value): Boolean = {
    getPiece(square).exists(_.color != color)
  }
  
  def findKing(color: PieceColor.Value): Option[Square] = {
    squares.find {
      case (_, piece) => piece.isInstanceOf[King] && piece.color == color
    }.map(_._1)
  }
  
  def displayBoard: String = {
    val sb = new StringBuilder
    sb.append("  a b c d e f g h\n")
    for (rank <- 7 to 0 by -1) {
      sb.append((rank + 1).toString)
      sb.append(" ")
      for (file <- 0 until 8) {
        val square = Square(file, rank)
        val piece = getPiece(square)
        val symbol = piece.map(_.symbol).getOrElse(".")
        sb.append(symbol)
        sb.append(" ")
      }
      sb.append((rank + 1).toString)
      sb.append("\n")
    }
    sb.append("  a b c d e f g h\n")
    sb.toString
  }
}

object Board {
  def initialPosition: Map[Square, Piece] = {
    val pieces = scala.collection.mutable.Map[Square, Piece]()
    
    // Place pawns
    for (file <- 0 until 8) {
      pieces(Square(file, 1)) = Pawn(PieceColor.WHITE)
      pieces(Square(file, 6)) = Pawn(PieceColor.BLACK)
    }
    
    // Place rooks
    pieces(Square(0, 0)) = Rook(PieceColor.WHITE)
    pieces(Square(7, 0)) = Rook(PieceColor.WHITE)
    pieces(Square(0, 7)) = Rook(PieceColor.BLACK)
    pieces(Square(7, 7)) = Rook(PieceColor.BLACK)
    
    // Place knights
    pieces(Square(1, 0)) = Knight(PieceColor.WHITE)
    pieces(Square(6, 0)) = Knight(PieceColor.WHITE)
    pieces(Square(1, 7)) = Knight(PieceColor.BLACK)
    pieces(Square(6, 7)) = Knight(PieceColor.BLACK)
    
    // Place bishops
    pieces(Square(2, 0)) = Bishop(PieceColor.WHITE)
    pieces(Square(5, 0)) = Bishop(PieceColor.WHITE)
    pieces(Square(2, 7)) = Bishop(PieceColor.BLACK)
    pieces(Square(5, 7)) = Bishop(PieceColor.BLACK)
    
    // Place queens
    pieces(Square(3, 0)) = Queen(PieceColor.WHITE)
    pieces(Square(3, 7)) = Queen(PieceColor.BLACK)
    
    // Place kings
    pieces(Square(4, 0)) = King(PieceColor.WHITE)
    pieces(Square(4, 7)) = King(PieceColor.BLACK)
    
    pieces.toMap
  }
  
  def empty: Board = Board(Map[Square, Piece]())
}
