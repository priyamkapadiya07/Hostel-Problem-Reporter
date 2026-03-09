import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  generateInvite(inviteData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/invite`, inviteData, { headers: this.getHeaders() });
  }

  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/students`, { headers: this.getHeaders() });
  }

  updateStudent(id: number, studentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/students/${id}`, studentData, { headers: this.getHeaders() });
  }

  updateHostel(hostelData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/hostel`, hostelData, { headers: this.getHeaders() });
  }
}
