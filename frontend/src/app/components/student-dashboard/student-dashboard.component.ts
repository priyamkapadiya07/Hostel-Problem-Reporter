import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';
import { ReportComplaintComponent } from '../report-complaint/report-complaint.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, ReportComplaintComponent],
  template: `
    <div class="dashboard-header">
      <h2>Student Dashboard</h2>
    </div>

    <div class="dashboard-content">
      <div class="left-column">
        <!-- PROFILE CARD -->
        <div class="card profile-card" *ngIf="profile">
          <div class="profile-header">
            <h3>Student Profile</h3>
            <span class="hostel-badge">{{profile.hostel_name || 'Unassigned'}}</span>
          </div>
          <div class="profile-details">
            <div class="detail-group">
              <span class="label">Name</span>
              <span class="value">{{profile.full_name || profile.email}}</span>
            </div>
            <div class="detail-group">
              <span class="label">Room</span>
              <span class="value">{{profile.room_number || 'N/A'}}</span>
            </div>
            <div class="detail-group">
              <span class="label">Email</span>
              <span class="value">{{profile.email}}</span>
            </div>
          </div>
        </div>

        <app-report-complaint (complaintSubmitted)="loadComplaints()"></app-report-complaint>
      </div>

      <div class="card my-complaints">
        <h3>My Complaints</h3>
        <div *ngIf="isLoading" class="loading">Loading complaints...</div>
        <div *ngIf="!isLoading && complaints.length === 0" class="no-data">You have not reported any problems yet.</div>
        
        <div class="complaint-list" *ngIf="complaints.length > 0">
          <div class="complaint-item" *ngFor="let c of complaints">
            <div class="complaint-header">
              <h4>{{c.title}} <span class="category-badge">{{c.category}}</span></h4>
              <span class="status-badge" [ngClass]="c.status">{{c.status}}</span>
            </div>
            <p class="complaint-desc">{{c.description}}</p>
            <div *ngIf="c.image_url" class="complaint-image">
              <img [src]="'http://localhost:3000' + c.image_url" alt="Complaint Attachment" style="max-width: 100%; border-radius: 4px; margin-top: 10px;">
            </div>
            <div class="complaint-meta">
              Reported on: {{c.created_at | date:'medium'}}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dashboard-header { margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb; animation: fadeInSlideUp 0.4s ease-out; }
    .dashboard-header h2 { color: #1f2937; font-size: 1.8rem; font-weight: 700; margin: 0; }
    .dashboard-content { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .left-column { display: flex; flex-direction: column; gap: 30px; }
    @media (max-width: 992px) { .dashboard-content { grid-template-columns: 1fr; } }
    .card { background: #fff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); animation: fadeInSlideUp 0.6s ease-out; }
    h3 { margin-top: 0; color: #111827; font-size: 1.25rem; font-weight: 600; margin-bottom: 20px; }
    
    .profile-card { border-top: 4px solid #4f46e5; }
    .profile-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f3f4f6; padding-bottom: 15px;}
    .profile-header h3 { margin: 0; }
    .hostel-badge { background: #eef2ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; border: 1px solid #c7d2fe; }
    .profile-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .detail-group { display: flex; flex-direction: column; }
    .detail-group .label { font-size: 0.8rem; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
    .detail-group .value { font-size: 1rem; color: #1f2937; font-weight: 500; margin-top: 4px; }
    
    .complaint-item { 
      border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px; 
      transition: transform 0.2s, box-shadow 0.2s; background: #fafafa;
    }
    .complaint-item:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); background: #ffffff; }
    .complaint-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 10px; }
    .complaint-header h4 { margin: 0; color: #1f2937; font-size: 1.1rem; line-height: 1.4; display: flex; align-items: center; flex-wrap: wrap; gap: 10px;}
    .category-badge { font-size: 0.75rem; font-weight: 600; color: #3b82f6; background: #eff6ff; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 20px; }
    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-badge.pending { background-color: #fef3c7; color: #d97706; }
    .status-badge.in_progress { background-color: #dbeafe; color: #1d4ed8; }
    .status-badge.solved { background-color: #d1fae5; color: #059669; }
    .complaint-desc { color: #4b5563; margin-bottom: 15px; white-space: pre-wrap; line-height: 1.6; }
    .complaint-image img { border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .complaint-meta { font-size: 0.85rem; color: #9ca3af; display: flex; align-items: center; gap: 5px; margin-top: 10px; border-top: 1px solid #f3f4f6; padding-top: 10px;}
    .loading, .no-data { text-align: center; color: #6b7280; padding: 40px 20px; font-size: 1.1rem; background: #f9fafb; border-radius: 8px; border: 2px dashed #e5e7eb; }
  `]
})
export class StudentDashboardComponent implements OnInit {
  complaints: any[] = [];
  profile: any = null;
  newComplaint = { title: '', description: '' };
  isSubmitting = false;
  isLoading = true;
  error = '';
  success = '';

  constructor(
    private complaintService: ComplaintService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadComplaints();
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  loadComplaints() {
    this.isLoading = true;
    this.complaintService.getComplaints().subscribe({
      next: (data) => {
        this.complaints = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load complaints', err);
        this.isLoading = false;
      }
    });
  }
}
