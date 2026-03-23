import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game',
  template: `
    <div class="game-container">
      <div class="header">
        <h1>Chess Game</h1>
        <button (click)="goHome()" class="home-btn">← Back to Home</button>
      </div>
      
      <div class="mode-selector" *ngIf="!uiMode">
        <h2>Select Game Display Mode</h2>
        <button (click)="selectMode('tui')" class="mode-btn tui-btn">
          📝 Text UI (TUI)<br/>
          <small>ASCII board with keyboard input</small>
        </button>
        <button (click)="selectMode('gui')" class="mode-btn gui-btn">
          🎨 Visual UI (GUI)<br/>
          <small>Interactive board with piece images</small>
        </button>
      </div>
      
      <!-- TUI Component -->
      <app-board-tui *ngIf="uiMode === 'tui'"></app-board-tui>
      
      <!-- GUI Component -->
      <app-board-gui *ngIf="uiMode === 'gui'"></app-board-gui>
    </div>
  `,
  styles: [`
    .game-container {
      min-height: 100vh;
      padding: 20px;
      background-color: #f5f5f5;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .home-btn {
      padding: 10px 20px;
      background-color: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .home-btn:hover {
      background-color: #1976D2;
    }
    
    .mode-selector {
      max-width: 600px;
      margin: 50px auto;
      text-align: center;
    }
    
    .mode-btn {
      display: inline-block;
      padding: 40px;
      margin: 20px;
      font-size: 18px;
      font-weight: bold;
      border: 2px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      background-color: white;
      min-width: 200px;
    }
    
    .mode-btn:hover {
      border-color: #4CAF50;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      transform: translateY(-2px);
    }
    
    .mode-btn small {
      display: block;
      font-size: 12px;
      font-weight: normal;
      color: #666;
      margin-top: 10px;
    }
    
    .tui-btn {
      color: #2196F3;
    }
    
    .gui-btn {
      color: #4CAF50;
    }
  `]
})
export class GameComponent implements OnInit {
  uiMode: string | null = null;
  gameId: string = '';
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.gameId = params['gameId'];
    });
    
    this.route.queryParams.subscribe(params => {
      if (params['mode']) {
        this.uiMode = params['mode'];
      }
    });
  }
  
  selectMode(mode: string): void {
    this.uiMode = mode;
  }
  
  goHome(): void {
    window.location.href = '/';
  }
}
