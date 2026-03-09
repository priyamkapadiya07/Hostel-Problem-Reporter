import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h2>{{inviteToken ? 'Complete Registration' : 'Register'}}</h2>
      <div *ngIf="error" class="error-msg">{{error}}</div>
      <div *ngIf="success" class="success-msg">{{success}}</div>
      
      <div *ngIf="isLoadingInvite" class="loading-msg">Verifying invitation...</div>
      
      <form *ngIf="!isLoadingInvite" (ngSubmit)="inviteToken ? onInviteSubmit() : onSubmit()">
        
        <!-- STANDARD REGISTRATION (Admin / Legacy) -->
        <ng-container *ngIf="!inviteToken">
          <div class="form-group">
            <label for="username">Username (Email)</label>
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
          <div class="form-group">
            <label for="role">Role</label>
            <select id="role" name="role" [(ngModel)]="role" required>
              <option value="admin">Admin</option>
            </select>
            <small class="text-muted">Students must use an invite link provided by an admin.</small>
          </div>
          <div class="form-group" *ngIf="role === 'admin'">
            <label for="hostel_name">Hostel Name</label>
            <input type="text" id="hostel_name" name="hostel_name" [(ngModel)]="hostel_name" required placeholder="Name of your Hostel">
          </div>
        </ng-container>

        <!-- INVITE REGISTRATION (Student) -->
        <ng-container *ngIf="inviteToken && inviteDetails">
          <div class="form-group">
            <label>Name</label>
            <input type="text" [value]="inviteDetails.full_name" disabled class="readonly-input">
          </div>
          <div class="form-group form-row">
            <div style="flex: 1;">
              <label>Email</label>
              <input type="text" [value]="inviteDetails.email" disabled class="readonly-input">
            </div>
            <div style="flex: 1;">
              <label>Room</label>
              <input type="text" [value]="inviteDetails.room_number" disabled class="readonly-input">
            </div>
          </div>
          <div class="form-group password-group">
            <label for="password">Create Password</label>
            <div class="input-with-icon">
              <input [type]="showPassword ? 'text' : 'password'" id="password" name="password" [(ngModel)]="password" required placeholder="Choose a secure password">
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword" title="Toggle Password Visibility">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
        </ng-container>

        <button type="submit" class="btn btn-primary" [disabled]="isLoading || (inviteToken && !inviteDetails)">
          {{isLoading ? 'Registering...' : 'Register'}}
        </button>
      </form>
      <p class="auth-link">Already have an account? <a routerLink="/login">Login here</a></p>
    </div>
  `,

  styles: [`
    @keyframes fadeInSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .auth-container { 
      max-width: 400px; margin: 60px auto; padding: 30px; border-radius: 12px; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.1); background-color: #fff;
      animation: fadeInSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    h2 { text-align: center; color: #1f2937; margin-bottom: 25px; font-weight: 700; font-size: 2rem; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; color: #4b5563; font-weight: 500; }
    input, select { 
      width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; 
      box-sizing: border-box; transition: all 0.3s ease; font-size: 1rem;
    }
    input:focus, select:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2); }
    .btn { 
      width: 100%; padding: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
      color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; 
      font-weight: 600; transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
    .btn:disabled { background: #9ca3af; cursor: not-allowed; }
    .error-msg { 
      color: #991b1b; background-color: #fee2e2; padding: 12px; border-radius: 8px; 
      margin-bottom: 20px; text-align: center; font-weight: 500; font-size: 0.95rem;
    }
    .success-msg { 
      color: #065f46; background-color: #d1fae5; padding: 12px; border-radius: 8px; 
      margin-bottom: 20px; text-align: center; font-weight: 500; font-size: 0.95rem;
    }
    .loading-msg { text-align: center; color: #6b7280; margin: 20px 0; font-weight: 500; }
    .auth-link { text-align: center; margin-top: 25px; color: #6b7280; }
    .auth-link a { color: #10b981; text-decoration: none; font-weight: 600; transition: color 0.2s; }
    .auth-link a:hover { color: #047857; text-decoration: underline; }
    .text-muted { color: #6b7280; font-size: 0.8rem; display: block; margin-top: 5px; }
    .readonly-input { background-color: #f3f4f6; color: #6b7280; cursor: not-allowed; }
    .readonly-input:focus { border-color: #d1d5db; box-shadow: none; }
    .form-row { display: flex; gap: 10px; }
    
    .password-group .input-with-icon { position: relative; display: flex; align-items: center; }
    .input-with-icon input { padding-right: 45px; }
    .toggle-password { 
      position: absolute; right: 12px; background: none; border: none; cursor: pointer; 
      font-size: 1.2rem; color: #6b7280; padding: 0; display: flex; align-items: center; justify-content: center;
      transition: color 0.2s;
    }
    .toggle-password:hover { color: #10b981; }
  `]
})
export class RegisterComponent implements OnInit {
  username = '';
  password = '';
  showPassword = false;
  role = 'admin'; // Default to admin for normal registration
  hostel_name = '';
  error = '';
  success = '';
  isLoading = false;

  inviteToken: string | null = null;
  inviteDetails: any = null;
  isLoadingInvite = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.logout();

    this.route.queryParams.subscribe(params => {
      this.inviteToken = params['token'];
      if (this.inviteToken) {
        this.verifyToken();
      }
    });
  }

  verifyToken() {
    this.isLoadingInvite = true;
    this.authService.verifyInvite(this.inviteToken!).subscribe({
      next: (res) => {
        this.inviteDetails = res;
        this.isLoadingInvite = false;
      },
      error: (err) => {
        this.error = 'Invalid or expired invitation link.';
        this.isLoadingInvite = false;
      }
    });
  }

  onInviteSubmit() {
    if (!this.password) {
      this.error = 'Please enter a password';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = '';

    this.authService.registerInvite({ token: this.inviteToken, password: this.password }).subscribe({
      next: (res) => {
        this.success = 'Registration successful! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Registration failed';
      }
    });
  }

  onSubmit() {
    if (!this.username || !this.password || !this.role) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.role === 'admin' && !this.hostel_name) {
      this.error = 'Please provide a Hostel Name';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = '';

    const registerData = {
      username: this.username,
      password: this.password,
      role: this.role,
      hostel_name: this.role === 'admin' ? this.hostel_name : undefined
    };

    this.authService.register(registerData).subscribe({
      next: (res) => {
        this.success = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Registration failed';
      }
    });
  }
}
