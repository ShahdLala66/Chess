import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <h1>Chess Game</h1>
      <p>Welcome to the Chess Game!</p>
      
      <div class="action-section">
        <h2>Create or Join a Game</h2>
        
        <div class="form-group">
          <label>Player 1 ID:</label>
          <input [(ngModel)]="player1Id" placeholder="e.g., player1" />
        </div>
        
        <div class="form-group">
          <label>Player 2 ID:</label>
          <input [(ngModel)]="player2Id" placeholder="e.g., player2" />
        </div>
        
        <button (click)="createGame()" class="create-btn">Create New Game</button>
      </div>
      
      <div class="join-section">
        <h2>Join Existing Game</h2>
        <div class="form-group">
          <label>Game ID:</label>
          <input [(ngModel)]="gameId" placeholder="Paste game ID..." />
        </div>
        <button (click)="joinGame()" class="join-btn">Join Game</button>
      </div>
      
      <div class="error" *ngIf="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      text-align: center;
    }
    
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
    
    .action-section, .join-section {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #ddd;
    }
    
    .form-group {
      margin-bottom: 15px;
      text-align: left;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .form-group input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    
    .create-btn, .join-btn {
      background-color: #4CAF50;
      color: white;
      padding: 12px 30px;
      font-size: 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
    }
    
    .create-btn:hover, .join-btn:hover {
      background-color: #45a049;
    }
    
    .error {
      color: red;
      margin-top: 20px;
      padding: 10px;
      background-color: #ffebee;
      border-radius: 4px;
    }
  `]
})
export class HomeComponent {
  player1Id: string = '';
  player2Id: string = '';
  gameId: string = '';
  error: string = '';
  
  constructor(
    private gameService: GameService,
    private router: Router
  ) {}
  
  createGame(): void {
    if (!this.player1Id || !this.player2Id) {
      this.error = 'Please enter both player IDs';
      return;
    }
    
    this.gameService.createGame(this.player1Id, this.player2Id).subscribe(
      game => {
        this.router.navigate(['/game', game.gameId], { 
          queryParams: { mode: 'gui' } 
        });
      },
      error => this.error = 'Failed to create game'
    );
  }
  
  joinGame(): void {
    if (!this.gameId) {
      this.error = 'Please enter a game ID';
      return;
    }
    
    this.router.navigate(['/game', this.gameId], { 
      queryParams: { mode: 'gui' } 
    });
  }
}
