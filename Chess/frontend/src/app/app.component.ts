import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>♔ Chess Game ♔</h1>
      </header>
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
      <footer class="app-footer">
        <p>&copy; 2024 Chess Game | Two-Player Chess</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .app-header {
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    .app-header h1 {
      margin: 0;
      font-size: 32px;
      letter-spacing: 2px;
    }
    
    .app-main {
      flex: 1;
      background-color: white;
      margin: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      overflow: auto;
    }
    
    .app-footer {
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      text-align: center;
    }
    
    .app-footer p {
      margin: 0;
    }
  `]
})
export class AppComponent {
  title = 'Chess Frontend';
}
