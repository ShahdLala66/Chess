package com.chess.models

object PieceColor extends Enumeration {
  type PieceColor = Value
  val WHITE, BLACK = Value
}

object PieceType extends Enumeration {
  type PieceType = Value
  val PAWN, ROOK, KNIGHT, BISHOP, QUEEN, KING = Value
}

import PieceColor._
import PieceType._

sealed trait Piece {
  def color: PieceColor
  def pieceType: PieceType
  def symbol: String = {
    val typeSymbol = pieceType match {
      case PAWN => "P"
      case ROOK => "R"
      case KNIGHT => "N"
      case BISHOP => "B"
      case QUEEN => "Q"
      case KING => "K"
    }
    if (color == WHITE) typeSymbol else typeSymbol.toLowerCase
  }
}

case class Pawn(color: PieceColor) extends Piece { val pieceType = PAWN }
case class Rook(color: PieceColor) extends Piece { val pieceType = ROOK }
case class Knight(color: PieceColor) extends Piece { val pieceType = KNIGHT }
case class Bishop(color: PieceColor) extends Piece { val pieceType = BISHOP }
case class Queen(color: PieceColor) extends Piece { val pieceType = QUEEN }
case class King(color: PieceColor) extends Piece { val pieceType = KING }

object Piece {
  def fromString(s: String): Option[Piece] = {
    val color = if (s.head.isUpper) WHITE else BLACK
    val base = s.toUpperCase
    base match {
      case "P" => Some(Pawn(color))
      case "R" => Some(Rook(color))
      case "N" => Some(Knight(color))
      case "B" => Some(Bishop(color))
      case "Q" => Some(Queen(color))
      case "K" => Some(King(color))
      case _ => None
    }
  }
}
