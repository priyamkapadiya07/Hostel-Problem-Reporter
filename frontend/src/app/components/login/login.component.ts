import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h2>Login</h2>
      <div *ngIf="error" class="error-msg">{{error}}</div>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" name="username" [(ngModel)]="username" required>
        </div>
        <div class="form-group password-group">
          <label for="password">Password</label>
          <div class="input-with-icon">
            <input [type]="showPassword ? 'text' : 'password'" id="password" name="password" [(ngModel)]="password" required>
            <button type="button" class="toggle-password" (click)="showPassword = !showPassword" title="Toggle Password Visibility">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="isLoading">
          {{isLoading ? 'Logging in...' : 'Login'}}
        </button>
      </form>
      <p class="auth-link">Don't have an account? <a routerLink="/register">Register here</a></p>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .auth-container { 
      max-width: 400px; margin: 60px auto; padding: 30px; border-radius: 12px; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.1); background-color: #fff;
      animation: fadeIn 0.6s ease-out;
    }
    h2 { text-align: center; color: #1f2937; margin-bottom: 25px; font-weight: 700; font-size: 2rem; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; color: #4b5563; font-weight: 500; }
    input { 
      width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; 
      box-sizing: border-box; transition: all 0.3s ease; font-size: 1rem;
    }
    input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2); }
    .password-group .input-with-icon { position: relative; display: flex; align-items: center; }
    .input-with-icon input { padding-right: 45px; }
    .toggle-password { 
      position: absolute; right: 12px; background: none; border: none; cursor: pointer; 
      font-size: 1.2rem; color: #6b7280; padding: 0; display: flex; align-items: center; justify-content: center;
      transition: color 0.2s;
    }
    .toggle-password:hover { color: #4f46e5; }
    .btn { 
      width: 100%; padding: 12px; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); 
      color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; 
      font-weight: 600; transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .btn:disabled { background: #9ca3af; cursor: not-allowed; }
    .error-msg { 
      color: #991b1b; background-color: #fee2e2; padding: 12px; border-radius: 8px; 
      margin-bottom: 20px; text-align: center; font-weight: 500; font-size: 0.95rem;
    }
    .auth-link { text-align: center; margin-top: 25px; color: #6b7280; }
    .auth-link a { color: #4f46e5; text-decoration: none; font-weight: 600; transition: color 0.2s; }
    .auth-link a:hover { color: #3730a3; text-decoration: underline; }
  `]
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  showPassword = false;
  error = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Automatically log the user out if they visit the login page
    this.authService.logout();
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        const role = this.authService.getRole();
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/student']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Login failed';
      }
    });
  }
}
