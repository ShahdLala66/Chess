import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService, Game, Move } from '../../services/game.service';

interface BoardSquare {
  file: number;
  rank: number;
  isWhite: boolean;
  piece: any;
  isLegalMove: boolean;
  isLastMove: boolean;
}

@Component({
  selector: 'app-board-gui',
  template: `
    <div class="gui-board-container">
      <h2>Chess Board (Visual UI)</h2>
      
      <div class="game-info" *ngIf="game">
        <p><strong>Game ID:</strong> {{ game.gameId }}</p>
        <p><strong>Current Turn:</strong> {{ getTurnString() }}</p>
        <p><strong>Status:</strong> {{ getStatusString() }}</p>
      </div>
      
      <div class="board-wrapper">
        <div class="board">
          <div *ngFor="let square of boardSquares" 
               class="square"
               [ngClass]="[
                 square.isWhite ? 'white' : 'black',
                 square.isLegalMove ? 'legal-move' : '',
                 square.isLastMove ? 'last-move' : ''
               ]"
               (click)="selectSquare(square)">
            
            <div *ngIf="square.piece" class="piece">
              <img [src]="getPieceImage(square.piece)" 
                   [alt]="square.piece.symbol"
                   class="piece-image" />
            </div>
            
            <!-- Coordinate labels -->
            <div *ngIf="square.file === 0" class="rank-label">
              {{ square.rank + 1 }}
            </div>
            <div *ngIf="square.rank === 0" class="file-label">
              {{ getFileChar(square.file) }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="controls">
        <button (click)="resign()" class="resign-btn">Resign</button>
        <button (click)="resetSelection()" class="reset-btn">Reset</button>
      </div>
      
      <div class="move-history" *ngIf="game && game.moveHistory && game.moveHistory.length > 0">
        <h3>Move History:</h3>
        <ul>
          <li *ngFor="let move of game.moveHistory; let i = index">
            {{ i + 1 }}. {{ move.from }}{{ move.to }}
          </li>
        </ul>
      </div>
      
      <div class="error" *ngIf="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .gui-board-container {
      padding: 20px;
    }
    
    .board-wrapper {
      display: flex;
      justify-content: center;
      margin: 30px 0;
    }
    
    .board {
      display: grid;
      grid-template-columns: repeat(8, 60px);
      grid-template-rows: repeat(8, 60px);
      gap: 0;
      border: 3px solid #333;
      position: relative;
    }
    
    .square {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: background-color 0.2s;
    }
    
    .square.white {
      background-color: #f0d9b5;
    }
    
    .square.black {
      background-color: #b58863;
    }
    
    .square.legal-move {
      box-shadow: inset 0 0 10px rgba(50, 200, 50, 0.5);
    }
    
    .square.last-move {
      background-color: rgba(200, 200, 0, 0.3);
    }
    
    .piece {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .piece-image {
      width: 90%;
      height: 90%;
      object-fit: contain;
    }
    
    .rank-label {
      position: absolute;
      left: 2px;
      top: 2px;
      font-size: 10px;
      font-weight: bold;
      color: #666;
    }
    
    .file-label {
      position: absolute;
      right: 2px;
      bottom: 2px;
      font-size: 10px;
      font-weight: bold;
      color: #666;
    }
    
    .controls {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }
    
    .resign-btn, .reset-btn {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      border: none;
      border-radius: 4px;
    }
    
    .resign-btn {
      background-color: #f44336;
      color: white;
    }
    
    .reset-btn {
      background-color: #2196F3;
      color: white;
    }
    
    .move-history {
      margin-top: 20px;
      max-height: 150px;
      overflow-y: auto;
    }
    
    .move-history ul {
      list-style: none;
      padding: 0;
    }
    
    .move-history li {
      padding: 5px;
      background-color: #f5f5f5;
      margin: 2px 0;
      border-radius: 2px;
    }
    
    .error {
      color: red;
      margin-top: 10px;
      padding: 10px;
      background-color: #ffebee;
      border-radius: 4px;
    }
    
    .game-info {
      background-color: #e3f2fd;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
  `]
})
export class BoardGuiComponent implements OnInit {
  game: Game | null = null;
  boardSquares: BoardSquare[] = [];
  selectedSquare: BoardSquare | null = null;
  legalMoves: Move[] = [];
  error: string = '';
  gameId: string = '';
  playerId: string = '';
  assetPath: string = 'assets/pieces/';
  
  constructor(
    private gameService: GameService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this.playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    
    this.route.params.subscribe(params => {
      this.gameId = params['gameId'];
      if (this.gameId) {
        this.loadGame();
      }
    });
    
    this.gameService.game$.subscribe(game => {
      if (game) {
        this.game = game;
        this.updateBoard();
      }
    });
    
    this.gameService.error$.subscribe(error => {
      this.error = error;
    });
  }
  
  loadGame(): void {
    this.gameService.getGame(this.gameId).subscribe(
      game => {
        this.game = game;
        this.updateBoard();
      },
      error => this.error = 'Failed to load game'
    );
  }
  
  updateBoard(): void {
    if (!this.game) return;
    
    this.boardSquares = [];
    
    for (let rank = 7; rank >= 0; rank--) {
      for (let file = 0; file < 8; file++) {
        const isWhiteSquare = (file + rank) % 2 === 0;
        const squareKey = this.backendSquareKey(file, rank);
        
        // Handle potentially different JSON structures for the board
        let piece = null;
        if (this.game.board && this.game.board.squares) {
          piece = this.game.board.squares[squareKey] || null;
        }
        
        const square: BoardSquare = {
          file,
          rank,
          isWhite: isWhiteSquare,
          piece,
          isLegalMove: this.legalMoves.some(m => 
            m.to.file === file && m.to.rank === rank
          ),
          isLastMove: false // TODO: Implement last move highlighting
        };
        
        this.boardSquares.push(square);
      }
    }
  }
  
  selectSquare(square: BoardSquare): void {
    if (this.selectedSquare === null) {
      // First selection
      const currentTurnVal = this.game?.currentTurn && typeof this.game.currentTurn === 'object' 
        ? (this.game.currentTurn as any).value 
        : this.game?.currentTurn;
        
      const pieceColorVal = square.piece && typeof square.piece.color === 'object'
        ? square.piece.color.value
        : square.piece?.color;
        
      if (square.piece && pieceColorVal === currentTurnVal) {
        this.selectedSquare = square;
        this.loadLegalMoves(square.file, square.rank);
      }
    } else {
      // Second selection - attempt move
      if (square === this.selectedSquare) {
        this.resetSelection();
      } else {
        // Player ID needs to be determined by the turn
        // If it's WHITE's turn, send player1Id, if BLACK, send player2Id
        const activePlayerId = this.getTurnString() === 'WHITE' 
          ? this.game?.player1Id 
          : this.game?.player2Id;
          
        if (!activePlayerId) {
           this.error = 'Cannot determine active player';
           return;
        }

        const move: Move = {
          from: { 
            file: this.selectedSquare.file, 
            rank: this.selectedSquare.rank,
            toAlgebraic: ''
          },
          to: { 
            file: square.file, 
            rank: square.rank,
            toAlgebraic: ''
          }
        };
        
        this.gameService.makeMove(this.gameId, move, activePlayerId).subscribe(
          game => {
            this.error = '';
            this.resetSelection();
            this.game = game;
            this.updateBoard();
          },
          error => {
            console.error('Move error:', error);
            // Check if error is in the root, or nested in error.error, or a bad request response
            if (error.error && error.error.error) {
              this.error = error.error.error;
            } else if (typeof error === 'string') {
              this.error = error;
            } else {
              this.error = 'Invalid move. That move violates the rules of chess or the piece is blocked.';
            }
            this.resetSelection();
          }
        );
      }
    }
  }
  
  loadLegalMoves(file: number, rank: number): void {
    // This would call backend to get legal moves
    // For now, we'll just show the selected square
  }
  
  resetSelection(): void {
    this.selectedSquare = null;
    this.legalMoves = [];
    this.updateBoard();
  }
  
  resign(): void {
    if (confirm('Are you sure you want to resign?')) {
      this.gameService.resign(this.gameId, this.playerId).subscribe(
        game => {
          this.game = game;
          alert('Game resigned');
        },
        error => this.error = 'Failed to resign'
      );
    }
  }
  
  getTurnString(): string {
    if (!this.game || !this.game.currentTurn) return '';
    return typeof this.game.currentTurn === 'object' ? (this.game.currentTurn as any).value : this.game.currentTurn;
  }
  
  getStatusString(): string {
    if (!this.game || !this.game.status) return '';
    return typeof this.game.status === 'object' ? (this.game.status as any).value : this.game.status;
  }
  
  getPieceImage(piece: any): string {
    if (!piece) return '';
    // Handle Jackson serialized enums which wrap values in an object containing 'value'
    const colorVal = typeof piece.color === 'object' && piece.color.value ? piece.color.value : piece.color;
    const typeVal = typeof piece.pieceType === 'object' && piece.pieceType.value ? piece.pieceType.value : piece.pieceType;
    
    const color = colorVal === 'WHITE' ? 'white' : 'black';
    const type = typeVal.toLowerCase();
    return `${this.assetPath}${color}_${type}.png`;
  }
  
  getFileChar(file: number): string {
    return String.fromCharCode('a'.charCodeAt(0) + file);
  }
  
  private squareToKey(file: number, rank: number): string {
    const fileChar = String.fromCharCode('a'.charCodeAt(0) + file);
    return fileChar + (rank + 1);
  }
  
  private backendSquareKey(file: number, rank: number): string {
    return `Square(${file},${rank})`;
  }
}
