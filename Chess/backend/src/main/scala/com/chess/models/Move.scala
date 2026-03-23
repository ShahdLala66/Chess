package com.chess.models

case class Move(
  from: Square,
  to: Square,
  promotion: Option[PieceType.Value] = None
) {
  
  def toAlgebraic: String = {
    val base = s"${from.toAlgebraic}${to.toAlgebraic}"
    promotion match {
      case Some(PieceType.QUEEN) => s"${base}q"
      case Some(PieceType.ROOK) => s"${base}r"
      case Some(PieceType.BISHOP) => s"${base}b"
      case Some(PieceType.KNIGHT) => s"${base}n"
      case _ => base
    }
  }
}

object Move {
  def fromAlgebraic(algebraic: String): Option[Move] = {
    if (algebraic.length < 4) return None
    
    val fromStr = algebraic.substring(0, 2)
    val toStr = algebraic.substring(2, 4)
    val promotion = if (algebraic.length > 4) Some(algebraic(4)) else None
    
    for {
      from <- Square.fromAlgebraic(fromStr)
      to <- Square.fromAlgebraic(toStr)
      prom <- promotion match {
        case Some('q') => Some(Some(PieceType.QUEEN))
        case Some('r') => Some(Some(PieceType.ROOK))
        case Some('b') => Some(Some(PieceType.BISHOP))
        case Some('n') => Some(Some(PieceType.KNIGHT))
        case None => Some(None)
        case _ => None
      }
    } yield Move(from, to, prom)
  }
}
