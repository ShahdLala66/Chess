import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Piece {
  color: 'WHITE' | 'BLACK';
  pieceType: string;
  symbol: string;
}

export interface Square {
  file: number;
  rank: number;
  toAlgebraic: string;
}

export interface Move {
  from: Square;
  to: Square;
  promotion?: string;
}

export interface Board {
  squares: Record<string, any>;
  get?: (key: string) => any;
}

export interface Game {
  gameId: string;
  player1Id: string;
  player2Id: string;
  board: Board;
  moveHistory: Move[];
  currentTurn: any;
  status: any;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:8080/api';
  private wsUrl = 'ws://localhost:8080/api/ws';
  
  private gameSubject = new BehaviorSubject<Game | null>(null);
  public game$ = this.gameSubject.asObservable();
  
  private legalMovesSubject = new BehaviorSubject<Move[]>([]);
  public legalMoves$ = this.legalMovesSubject.asObservable();
  
  private errorSubject = new BehaviorSubject<string>('');
  public error$ = this.errorSubject.asObservable();
  
  private ws: WebSocket | null = null;
  
  constructor() {}
  
  /**
   * Create a new game
   */
  createGame(player1Id: string, player2Id: string): Observable<Game> {
    return new Observable(observer => {
      fetch(`${this.apiUrl}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player1Id, player2Id })
      })
        .then(res => res.json())
        .then(game => {
          this.gameSubject.next(game);
          observer.next(game);
        })
        .catch(err => observer.error(err));
    });
  }
  
  /**
   * Get a game by ID
   */
  getGame(gameId: string): Observable<Game> {
    return new Observable(observer => {
      fetch(`${this.apiUrl}/games/${gameId}`)
        .then(res => res.json())
        .then(game => {
          this.gameSubject.next(game);
          observer.next(game);
        })
        .catch(err => observer.error(err));
    });
  }
  
  /**
   * Make a move
   */
  makeMove(gameId: string, move: Move, playerId: string): Observable<Game> {
    return new Observable(observer => {
      fetch(`${this.apiUrl}/games/${gameId}/moves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move, playerId })
      })
        .then(res => res.json())
        .then(game => {
          this.gameSubject.next(game);
          observer.next(game);
        })
        .catch(err => {
          this.errorSubject.next(err.message);
          observer.error(err);
        });
    });
  }
  
  /**
   * Get legal moves for current position
   */
  getLegalMoves(gameId: string, playerId: string): Observable<Move[]> {
    return new Observable(observer => {
      fetch(`${this.apiUrl}/games/${gameId}/legal-moves?playerId=${playerId}`)
        .then(res => res.json())
        .then(moves => {
          this.legalMovesSubject.next(moves);
          observer.next(moves);
        })
        .catch(err => observer.error(err));
    });
  }
  
  /**
   * Resign from game
   */
  resign(gameId: string, playerId: string): Observable<Game> {
    return new Observable(observer => {
      fetch(`${this.apiUrl}/games/${gameId}/resign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })
        .then(res => res.json())
        .then(game => {
          this.gameSubject.next(game);
          observer.next(game);
        })
        .catch(err => observer.error(err));
    });
  }
  
  /**
   * Connect to WebSocket for real-time updates
   */
  connectWebSocket(gameId: string): void {
    if (this.ws) {
      this.ws.close();
    }
    
    this.ws = new WebSocket(`${this.wsUrl}/games/${gameId}`);
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'game_state_change') {
        this.gameSubject.next(message.payload);
      }
    };
    
    this.ws.onerror = (event) => {
      this.errorSubject.next('WebSocket connection error');
      console.error('WebSocket error:', event);
    };
  }
  
  /**
   * Disconnect from WebSocket
   */
  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  /**
   * Get current game state
   */
  getCurrentGame(): Game | null {
    return this.gameSubject.value;
  }
}
