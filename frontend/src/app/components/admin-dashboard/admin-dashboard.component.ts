import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../services/complaint.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-header">
      <h2>Admin Dashboard</h2>
      <p>Manage all student complaints and hostel registrations</p>
      
      <div class="tabs">
        <button [class.active]="activeTab === 'complaints'" (click)="activeTab = 'complaints'">Complaints</button>
        <button [class.active]="activeTab === 'students'" (click)="activeTab = 'students'">Manage Students</button>
        <button [class.active]="activeTab === 'settings'" (click)="activeTab = 'settings'">Settings</button>
      </div>
      
      <div class="filter-section" *ngIf="activeTab === 'complaints'">
        <label for="adminCategoryFilter">Filter by Category:</label>
        <select id="adminCategoryFilter" [(ngModel)]="selectedCategory" (change)="onCategoryChange()">
          <option *ngFor="let cat of categories" [value]="cat">{{cat}}</option>
        </select>
      </div>
    </div>

    <!-- COMPLAINTS TAB -->
    <div class="card all-complaints" *ngIf="activeTab === 'complaints'">
      <div *ngIf="isLoading" class="loading">Loading complaints...</div>
      <div *ngIf="!isLoading && filteredComplaints.length === 0" class="no-data">No complaints found.</div>
      
      <div class="admin-table-container" *ngIf="filteredComplaints.length > 0">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Issue</th>
              <th>Reported On</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of filteredComplaints">
              <td>{{c.id}}</td>
              <td>
                <strong>{{c.full_name || c.student_name}}</strong>
                <div class="room-label" *ngIf="c.room_number">Room: {{c.room_number}}</div>
              </td>
              <td>
                <div class="issue-title">{{c.title}} <span class="category-badge">{{c.category}}</span></div>
                <div class="issue-desc">{{c.description}}</div>
                <div *ngIf="c.image_url" class="admin-image-link">
                  <a [href]="'http://localhost:3000' + c.image_url" target="_blank">🖼️ View Attachment</a>
                </div>
              </td>
              <td>{{c.created_at | date:'short'}}</td>
              <td>
                <span class="status-badge" [ngClass]="c.status">{{c.status}}</span>
              </td>
              <td>
                <select class="status-select" [ngModel]="c.status" (ngModelChange)="updateStatus(c.id, $event)">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="solved">Solved</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- STUDENTS TAB -->
    <div *ngIf="activeTab === 'students'" class="students-tab">
      <div class="invite-card card">
        <h3>Generate Student Invite</h3>
        <p class="desc">Create a single-use registration link tied strictly to your hostel.</p>
        <form (ngSubmit)="generateInvite()">
          <div class="form-row">
            <input type="email" placeholder="Student Email" [(ngModel)]="inviteForm.email" name="email" required>
            <input type="text" placeholder="Full Name" [(ngModel)]="inviteForm.full_name" name="name" required>
            <input type="text" placeholder="Room Number" [(ngModel)]="inviteForm.room_number" name="room" required>
            <button type="submit" class="btn-primary" [disabled]="isGenerating">Generate Link</button>
          </div>
        </form>
        <div class="invite-link-box" *ngIf="generatedToken">
          <p>Share this link securely with the student:</p>
          <div class="url-bar">
            <code>http://localhost:4200/register?token={{generatedToken}}</code>
          </div>
        </div>
      </div>

      <div class="card mt-20">
        <h3>Registered Students</h3>
        <div *ngIf="isLoadingStudents" class="loading">Loading students...</div>
        <div *ngIf="!isLoadingStudents && students.length === 0" class="no-data">No students registered yet.</div>
        
        <div class="admin-table-container" *ngIf="students.length > 0">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Room No</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of students">
                <td>
                  <input *ngIf="editingStudent?.id === s.id" type="text" [(ngModel)]="editingStudent.full_name" class="inline-input">
                  <strong *ngIf="editingStudent?.id !== s.id">{{s.full_name}}</strong>
                </td>
                <td>{{s.email}}</td>
                <td>
                  <input *ngIf="editingStudent?.id === s.id" type="text" [(ngModel)]="editingStudent.room_number" class="inline-input">
                  <span *ngIf="editingStudent?.id !== s.id">{{s.room_number}}</span>
                </td>
                <td>
                  <button class="btn-sm btn-edit" *ngIf="editingStudent?.id !== s.id" (click)="editStudent(s)">Edit</button>
                  <div class="edit-actions" *ngIf="editingStudent?.id === s.id">
                    <button class="btn-sm btn-save" (click)="saveStudent(s.id)">Save</button>
                    <button class="btn-sm btn-cancel" (click)="editingStudent = null">Cancel</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SETTINGS TAB -->
    <div *ngIf="activeTab === 'settings'" class="settings-tab">
      <div class="card">
        <h3>Hostel Settings</h3>
        <p class="desc">Update your hostel's profile and configuration.</p>
        
        <div *ngIf="profile" class="settings-form">
          <div class="form-group mb-15">
            <label>Current Hostel Name</label>
            <input type="text" [(ngModel)]="newHostelData.name" placeholder="Enter new hostel name" class="form-control">
          </div>
          <div class="form-group mb-15">
            <label>Hostel Address</label>
            <textarea [(ngModel)]="newHostelData.address" placeholder="123 Example Street" class="form-control" rows="3"></textarea>
          </div>
          <div class="form-group mb-15 form-row">
            <div style="flex: 1;">
              <label>Contact Email</label>
              <input type="email" [(ngModel)]="newHostelData.contact_email" placeholder="hostel@example.com" class="form-control">
            </div>
            <div style="flex: 1;">
              <label>Contact Phone</label>
              <input type="text" [(ngModel)]="newHostelData.contact_phone" placeholder="+1234567890" class="form-control">
            </div>
          </div>

          <button class="btn-primary" (click)="updateHostel()" [disabled]="isUpdatingHostel || !newHostelData.name">
            {{isUpdatingHostel ? 'Saving...' : 'Save Changes'}}
          </button>
          
          <div *ngIf="settingsMsg" class="mt-15 success-text">{{settingsMsg}}</div>
          <div *ngIf="settingsErr" class="mt-15 error-text">{{settingsErr}}</div>
        </div>
        <div *ngIf="!profile" class="loading">Loading profile...</div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb; flex-wrap: wrap; gap: 15px; animation: fadeInSlideUp 0.4s ease-out;}
    .dashboard-header h2 { margin: 0; color: #1f2937; font-size: 1.8rem; font-weight: 700;}
    .dashboard-header p { margin: 0; color: #6b7280; width: 100%; font-size: 0.95rem; }
    
    .filter-section { display: flex; align-items: center; gap: 12px; background: #fff; padding: 10px 20px; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid #f3f4f6;}
    .filter-section label { font-weight: 600; color: #4b5563; font-size: 0.95rem; }
    .filter-section select { 
      padding: 10px 16px; border-radius: 8px; border: 1px solid #d1d5db; background-color: #f9fafb; 
      font-size: 0.95rem; cursor: pointer; min-width: 160px; font-family: inherit; font-weight: 500; color: #374151;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .filter-section select:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.2); background-color: #fff;}
    
    .card { background: #fff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); width: 100%; box-sizing: border-box; animation: fadeInSlideUp 0.6s ease-out;}
    
    .admin-table-container { width: 100%; overflow-x: auto; border-radius: 8px; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px; }
    .admin-table th, .admin-table td { border-bottom: 1px solid #f3f4f6; padding: 18px 15px; vertical-align: middle; }
    .admin-table th { background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .admin-table tbody tr { transition: background-color 0.2s; }
    .admin-table tbody tr:hover { background-color: #f9fafb; }
    
    .status-badge { padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; text-align: center; }
    .status-badge.pending { background-color: #fef3c7; color: #d97706; }
    .status-badge.in_progress { background-color: #dbeafe; color: #1d4ed8; }
    .status-badge.solved { background-color: #d1fae5; color: #059669; }
    
    .issue-title { font-weight: 600; margin-bottom: 6px; color: #1f2937; font-size: 1rem; display: flex; align-items: center; flex-wrap: wrap; gap: 8px;}
    .category-badge { font-size: 0.7rem; font-weight: 600; color: #3b82f6; background: #eff6ff; border: 1px solid #bfdbfe; padding: 3px 8px; border-radius: 20px; }
    .issue-desc { font-size: 0.9rem; color: #6b7280; white-space: pre-wrap; line-height: 1.5; }
    .admin-image-link { margin-top: 8px; font-size: 0.9rem; }
    .admin-image-link a { color: #6366f1; text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: #eef2ff; border-radius: 6px; transition: background 0.2s;}
    .admin-image-link a:hover { background: #e0e7ff; color: #4f46e5; }
    
    .status-select { 
      padding: 8px 12px; border-radius: 8px; border: 1px solid #d1d5db; background: #f9fafb; 
      cursor: pointer; font-family: inherit; font-size: 0.9rem; font-weight: 500; color: #374151; transition: all 0.2s;
    }
    .status-select:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.2); background: #fff;}
    
    .loading, .no-data { text-align: center; color: #6b7280; padding: 40px 20px; font-size: 1.1rem; background: #f9fafb; border-radius: 8px; border: 2px dashed #e5e7eb; }

    .room-label { font-size: 0.8rem; color: #6b7280; margin-top: 4px; }
    
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; width: 100%; border-bottom: 2px solid #e5e7eb; padding-bottom: 1px;}
    .tabs button { 
      background: none; border: none; padding: 10px 20px; font-size: 1rem; font-weight: 600; color: #6b7280; 
      cursor: pointer; position: relative; bottom: -2px; transition: color 0.2s;
    }
    .tabs button:hover { color: #4f46e5; }
    .tabs button.active { color: #4f46e5; border-bottom: 3px solid #4f46e5; }
    
    .invite-card h3, .card h3 { margin-top: 0; color: #1f2937; margin-bottom: 5px;}
    .desc { color: #6b7280; font-size: 0.9rem; margin-bottom: 20px;}
    
    .form-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .form-row input { flex: 1; min-width: 150px; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-family: inherit; }
    .btn-primary { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { background: #4338ca; }
    .btn-primary:disabled { background: #a5a2e5; cursor: not-allowed; }
    
    .invite-link-box { margin-top: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; animation: fadeInSlideUp 0.3s; }
    .invite-link-box p { margin: 0 0 10px 0; color: #166534; font-weight: 600; font-size: 0.9rem; }
    .url-bar { background: #fff; border: 1px solid #86efac; padding: 10px; border-radius: 6px; user-select: all; }
    .url-bar code { color: #15803d; font-family: monospace; font-size: 0.95rem; }
    
    .mt-20 { margin-top: 20px; }
    .inline-input { padding: 6px; border: 1px solid #6366f1; border-radius: 4px; width: 90%; }
    .btn-sm { border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; color: white; }
    .btn-edit { background: #6b7280; }
    .btn-save { background: #10b981; }
    .btn-cancel { background: #ef4444; }
    .edit-actions { display: flex; gap: 5px; }
    
    .settings-form { max-width: 500px; }
    .mb-15 { margin-bottom: 15px; }
    .form-control { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-family: inherit; font-size: 1rem; box-sizing: border-box; }
    .form-control:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2); }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: #4b5563; }
    .form-row { display: flex; gap: 15px; flex-wrap: wrap; }
    .success-text { color: #059669; font-weight: 500; font-size: 0.9rem; }
    .error-text { color: #dc2626; font-weight: 500; font-size: 0.9rem; }
    .mt-15 { margin-top: 15px; }
    
    @media (max-width: 768px) {
      .admin-table, .admin-table thead, .admin-table tbody, .admin-table th, .admin-table td, .admin-table tr { 
        display: block; 
      }
      .admin-table thead tr { 
        position: absolute; top: -9999px; left: -9999px;
      }
      .admin-table { min-width: auto; }
      .admin-table tr { border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 20px; background: #fff; padding: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
      .admin-table td { border: none; border-bottom: 1px solid #f3f4f6; position: relative; padding-left: 110px; padding-top: 15px; padding-bottom: 15px; min-height: 30px;}
      .admin-table td:last-child { border-bottom: 0; }
      .admin-table td:before { 
        position: absolute; top: 15px; left: 15px; width: 85px; padding-right: 10px; font-weight: 600; color: #6b7280; font-size: 0.85rem; text-transform: uppercase;
      }
      .admin-table td:nth-of-type(1):before { content: "ID"; }
      .admin-table td:nth-of-type(2):before { content: "Student"; }
      .admin-table td:nth-of-type(3):before { content: "Issue"; }
      .admin-table td:nth-of-type(4):before { content: "Date"; }
      .admin-table td:nth-of-type(5):before { content: "Status"; }
      .admin-table td:nth-of-type(6):before { content: "Action"; }
      .card { background: transparent; box-shadow: none; padding: 10px 0; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  activeTab: 'complaints' | 'students' | 'settings' = 'complaints';
  
  complaints: any[] = [];
  filteredComplaints: any[] = [];
  isLoading = true;
  selectedCategory: string = 'All';
  categories = ['All', 'WiFi', 'Electricity', 'Water', 'Cleaning', 'Furniture', 'Other'];

  // Students Tab State
  students: any[] = [];
  isLoadingStudents = false;
  inviteForm = { email: '', full_name: '', room_number: '' };
  isGenerating = false;
  generatedToken: string | null = null;
  editingStudent: any = null;

  // Settings Tab State
  profile: any = null;
  newHostelData = {
    name: '',
    address: '',
    contact_email: '',
    contact_phone: ''
  };
  isUpdatingHostel = false;
  settingsMsg = '';
  settingsErr = '';

  constructor(
    private complaintService: ComplaintService,
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadComplaints();
    this.loadStudents();
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.newHostelData = {
          name: data.hostel_name || '',
          address: data.hostel_address || '',
          contact_email: data.hostel_email || '',
          contact_phone: data.hostel_phone || ''
        };
      },
      error: (err) => {
        console.error('Failed to load profile', err);
      }
    });
  }

  updateHostel() {
    this.isUpdatingHostel = true;
    this.settingsMsg = '';
    this.settingsErr = '';
    
    this.adminService.updateHostel(this.newHostelData).subscribe({
      next: (res) => {
        this.settingsMsg = 'Hostel updated successfully!';
        this.isUpdatingHostel = false;
        if (this.profile) {
          this.profile.hostel_name = this.newHostelData.name;
          this.profile.hostel_address = this.newHostelData.address;
          this.profile.hostel_email = this.newHostelData.contact_email;
          this.profile.hostel_phone = this.newHostelData.contact_phone;
        }
      },
      error: (err) => {
        this.settingsErr = err.error?.message || 'Failed to update hostel string';
        this.isUpdatingHostel = false;
      }
    });
  }

  loadComplaints() {
    this.isLoading = true;
    this.complaintService.getComplaints().subscribe({
      next: (data) => {
        this.complaints = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load complaints', err);
        this.isLoading = false;
      }
    });
  }

  onCategoryChange() {
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedCategory === 'All') {
      this.filteredComplaints = [...this.complaints];
    } else {
      this.filteredComplaints = this.complaints.filter(
        c => c.category === this.selectedCategory
      );
    }
  }

  updateStatus(id: number, newStatus: string) {
    this.complaintService.updateStatus(id, newStatus).subscribe({
      next: () => {
        this.loadComplaints();
      },
      error: (err) => {
        console.error('Failed to update status', err);
        alert('Failed to update status. Please try again.');
        this.loadComplaints(); // revert selection on error by reloading
      }
    });
  }

  // --- STUDENTS MANAGEMENT ---

  loadStudents() {
    this.isLoadingStudents = true;
    this.adminService.getStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.isLoadingStudents = false;
      },
      error: (err) => {
        console.error('Failed to load students', err);
        this.isLoadingStudents = false;
      }
    });
  }

  generateInvite() {
    if (!this.inviteForm.email || !this.inviteForm.full_name || !this.inviteForm.room_number) return;
    
    this.isGenerating = true;
    this.adminService.generateInvite(this.inviteForm).subscribe({
      next: (res) => {
        this.generatedToken = res.token;
        this.isGenerating = false;
        this.inviteForm = { email: '', full_name: '', room_number: '' };
      },
      error: (err) => {
        console.error('Failed to generate invite', err);
        alert(err.error?.message || 'Failed to generate invite');
        this.isGenerating = false;
      }
    });
  }

  editStudent(s: any) {
    // Clone the student object to avoid changing the table directly until saved
    this.editingStudent = { ...s };
  }

  saveStudent(id: number) {
    this.adminService.updateStudent(id, { 
      full_name: this.editingStudent.full_name, 
      room_number: this.editingStudent.room_number 
    }).subscribe({
      next: (res) => {
        const idx = this.students.findIndex(st => st.id === id);
        if (idx !== -1) {
          this.students[idx] = res;
        }
        this.editingStudent = null;
      },
      error: (err) => {
        console.error('Failed to update student', err);
        alert('Failed to update student settings');
      }
    });
  }
}
