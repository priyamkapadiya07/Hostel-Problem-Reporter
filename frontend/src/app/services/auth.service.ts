import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          sessionStorage.setItem('token', res.token);
          sessionStorage.setItem('role', res.role);
          sessionStorage.setItem('username', res.username);
          if (res.full_name) {
            sessionStorage.setItem('full_name', res.full_name);
          }
        }
      })
    );
  }

  getProfile(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.get(`${this.apiUrl}/profile`, { headers });
  }

  verifyInvite(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/invite/${token}`);
  }

  registerInvite(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-invite`, data).pipe(
      tap((res: any) => {
        // We could auto-login here or just let the user login normally.
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('username');
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  getRole(): string | null {
    return sessionStorage.getItem('role');
  }
  
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }
}
