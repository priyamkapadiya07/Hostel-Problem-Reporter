import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Hostel-Problem-Reporter';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private location: Location
  ) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getUsername(): string {
    return sessionStorage.getItem('username') || '';
  }

  goBack(event: Event) {
    event.preventDefault();
    this.location.back();
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
