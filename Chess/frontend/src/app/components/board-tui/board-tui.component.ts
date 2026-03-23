import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService, Game, Move } from '../../services/game.service';

@Component({
  selector: 'app-board-tui',
  template: `
    <div class="tui-board-container">
      <h2>Chess Board (Text UI)</h2>
      
      <div class="game-info" *ngIf="game">
        <p><strong>Game ID:</strong> {{ game.gameId }}</p>
        <p><strong>Current Turn:</strong> {{ getTurnString() }}</p>
        <p><strong>Status:</strong> {{ getStatusString() }}</p>
      </div>
      
      <pre class="board-display">{{ boardDisplay }}</pre>
      
      <div class="move-input-section">
        <label>Enter move (e.g., e2e4):</label>
        <input 
          [(ngModel)]="moveInput" 
          (keyup.enter)="submitMove()"
          placeholder="e2e4"
        />
        <button (click)="submitMove()">Make Move</button>
      </div>
      
      <div class="move-history" *ngIf="game && game.moveHistory.length > 0">
        <h3>Move History:</h3>
        <ul>
          <li *ngFor="let move of game.moveHistory">
            {{ move.from }}{{ move.to }}
          </li>
        </ul>
      </div>
      
      <div class="error" *ngIf="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .tui-board-container {
      padding: 20px;
      font-family: 'Courier New', monospace;
    }
    
    .board-display {
      background-color: #f5f5f5;
      border: 2px solid #333;
      padding: 10px;
      font-size: 14px;
      margin: 20px 0;
      line-height: 1.4;
    }
    
    .move-input-section {
      margin: 20px 0;
    }
    
    .move-input-section input {
      padding: 8px;
      margin-right: 10px;
      font-family: 'Courier New', monospace;
    }
    
    .move-input-section button {
      padding: 8px 16px;
      background-color: #4CAF50;
      color: white;
      border: none;
      cursor: pointer;
      border-radius: 4px;
    }
    
    .move-history {
      margin-top: 20px;
    }
    
    .error {
      color: red;
      margin-top: 10px;
    }
    
    .game-info {
      background-color: #e3f2fd;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
  `]
})
export class BoardTuiComponent implements OnInit {
  game: Game | null = null;
  boardDisplay: string = '';
  moveInput: string = '';
  error: string = '';
  gameId: string = '';
  playerId: string = ''; // Random player ID for now
  
  constructor(
    private gameService: GameService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    // Generate random player ID
    this.playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    
    // Get game ID from route params
    this.route.params.subscribe(params => {
      this.gameId = params['gameId'];
      if (this.gameId) {
        this.loadGame();
      }
    });
    
    // Subscribe to game updates
    this.gameService.game$.subscribe(game => {
      if (game) {
        this.game = game;
        this.updateBoardDisplay();
      }
    });
    
    this.gameService.error$.subscribe(error => {
      this.error = error;
    });
  }
  
  getTurnString(): string {
    if (!this.game || !this.game.currentTurn) return '';
    return typeof this.game.currentTurn === 'object' ? (this.game.currentTurn as any).value : this.game.currentTurn;
  }
  
  getStatusString(): string {
    if (!this.game || !this.game.status) return '';
    return typeof this.game.status === 'object' ? (this.game.status as any).value : this.game.status;
  }
  
  loadGame(): void {
    this.gameService.getGame(this.gameId).subscribe(
      game => this.game = game,
      error => this.error = 'Failed to load game'
    );
  }
  
  submitMove(): void {
    if (!this.moveInput || this.moveInput.length < 4) {
      this.error = 'Invalid move format. Use: e2e4';
      return;
    }
    
    const fromFile = this.moveInput.charCodeAt(0) - 'a'.charCodeAt(0);
    const fromRank = parseInt(this.moveInput[1]) - 1;
    const toFile = this.moveInput.charCodeAt(2) - 'a'.charCodeAt(0);
    const toRank = parseInt(this.moveInput[3]) - 1;
    
    const move: Move = {
      from: { file: fromFile, rank: fromRank, toAlgebraic: '' },
      to: { file: toFile, rank: toRank, toAlgebraic: '' }
    };
    
    this.gameService.makeMove(this.gameId, move, this.playerId).subscribe(
      game => {
        this.moveInput = '';
        this.error = '';
      },
      error => {
        this.error = error?.error?.error || 'Invalid move';
      }
    );
  }
  
  updateBoardDisplay(): void {
    if (!this.game) return;
    
    let display = '  a b c d e f g h\n';
    for (let rank = 7; rank >= 0; rank--) {
      display += (rank + 1) + ' ';
      for (let file = 0; file < 8; file++) {
        const squareKey = this.backendSquareKey(file, rank);
        let piece = null;
        if (this.game.board && this.game.board.squares) {
          piece = this.game.board.squares[squareKey] || null;
        }
        
        let symbol = '.';
        if (piece) {
          const type = typeof piece.pieceType === 'object' ? piece.pieceType.value : piece.pieceType;
          const color = typeof piece.color === 'object' ? piece.color.value : piece.color;
          
          let baseSymbol = '';
          switch (type) {
            case 'PAWN': baseSymbol = 'p'; break;
            case 'ROOK': baseSymbol = 'r'; break;
            case 'KNIGHT': baseSymbol = 'n'; break;
            case 'BISHOP': baseSymbol = 'b'; break;
            case 'QUEEN': baseSymbol = 'q'; break;
            case 'KING': baseSymbol = 'k'; break;
            default: baseSymbol = '?';
          }
          
          symbol = color === 'WHITE' ? baseSymbol.toUpperCase() : baseSymbol.toLowerCase();
        }
        
        display += symbol + ' ';
      }
      display += (rank + 1) + '\n';
    }
    display += '  a b c d e f g h\n';
    
    this.boardDisplay = display;
  }
  
  private squareToKey(file: number, rank: number): string {
    const fileChar = String.fromCharCode('a'.charCodeAt(0) + file);
    return fileChar + (rank + 1);
  }
  
  private backendSquareKey(file: number, rank: number): string {
    return `Square(${file},${rank})`;
  }
}
