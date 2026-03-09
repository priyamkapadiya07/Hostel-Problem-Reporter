import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComplaintService } from '../../services/complaint.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-complaint',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card new-complaint">
      <h3>Report a Problem</h3>
      <div *ngIf="error" class="error-msg">{{error}}</div>
      <div *ngIf="success" class="success-msg">{{success}}</div>
      
      <form [formGroup]="complaintForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="title">Title</label>
          <input type="text" id="title" formControlName="title" placeholder="e.g. Broken Fan in Room 204">
          <div *ngIf="complaintForm.get('title')?.touched && complaintForm.get('title')?.invalid" class="validation-error">
            Title is required.
          </div>
        </div>

        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" formControlName="category">
            <option value="" disabled>Select a category</option>
            <option *ngFor="let cat of categories" [value]="cat">{{cat}}</option>
          </select>
          <div *ngIf="complaintForm.get('category')?.touched && complaintForm.get('category')?.invalid" class="validation-error">
            Category is required.
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" formControlName="description" rows="4" placeholder="Please describe the issue in detail..."></textarea>
          <div *ngIf="complaintForm.get('description')?.touched && complaintForm.get('description')?.invalid" class="validation-error">
            Description is required.
          </div>
        </div>

        <div class="form-group">
          <label>Upload Image (Optional)</label>
          <div class="drop-zone" 
               (dragover)="onDragOver($event)" 
               (dragleave)="onDragLeave($event)" 
               (drop)="onDrop($event)"
               [class.dragover]="isDragging"
               (click)="fileInput.click()">
            
            <div class="drop-zone-content" *ngIf="!selectedFile">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
               </svg>
               <p>Click to upload or drag and drop</p>
               <p class="sub-text">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
            </div>
            
            <div class="file-preview" *ngIf="selectedFile">
               <div class="file-info">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                 <span class="file-name">{{selectedFile.name}}</span>
                 <span class="remove-file" (click)="removeFile($event)">×</span>
               </div>
            </div>
            
            <input type="file" #fileInput id="image" (change)="onFileChange($event)" accept="image/*" class="hidden-input">
          </div>
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="complaintForm.invalid || isSubmitting">
          {{isSubmitting ? 'Submitting...' : 'Submit Report'}}
        </button>
      </form>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .card { background: #fff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); animation: fadeIn 0.5s ease-out; margin-bottom: 20px;}
    h3 { margin-top: 0; color: #111827; font-size: 1.25rem; font-weight: 600; margin-bottom: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;}
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; color: #4b5563; font-weight: 500; font-size: 0.95rem; }
    input[type="text"], select, textarea { 
      width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; 
      box-sizing: border-box; font-family: inherit; font-size: 1rem; transition: border-color 0.2s, box-shadow 0.2s; background-color: #f9fafb;
    }
    input[type="text"]:focus, select:focus, textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); background-color: #fff;}
    .drop-zone {
      border: 2px dashed #d1d5db; border-radius: 12px; padding: 30px; text-align: center;
      background: #f9fafb; cursor: pointer; transition: all 0.2s ease; position: relative;
    }
    .drop-zone:hover, .drop-zone.dragover { border-color: #6366f1; background: #eef2ff; }
    .drop-zone-content { color: #6b7280; display: flex; flex-direction: column; align-items: center; }
    .drop-zone-content p { margin: 10px 0 0; font-size: 0.95rem; font-weight: 500; color: #4b5563;}
    .drop-zone-content .sub-text { font-size: 0.8rem; color: #9ca3af; margin-top: 4px; }
    .hidden-input { display: none; }
    
    .file-preview { display: flex; align-items: center; justify-content: center; }
    .file-info {
      background: #fff; padding: 10px 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); 
      border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 12px;
    }
    .file-name { font-weight: 500; color: #374151; font-size: 0.9rem; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
    .remove-file { color: #ef4444; font-size: 1.4rem; cursor: pointer; font-weight: bold; line-height: 1; margin-left: 5px;}
    .remove-file:hover { color: #b91c1c; }
    
    .btn { 
      padding: 12px 24px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); 
      color: white !important; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; 
      transition: transform 0.2s, box-shadow 0.2s; display: inline-flex; align-items: center; justify-content: center; width: 100%;
    }
    .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .btn:disabled { background: #d1d5db; cursor: not-allowed; transform: none; box-shadow: none; color: #6b7280 !important; }
    
    .error-msg { color: #991b1b; background-color: #fee2e2; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-weight: 500; font-size: 0.95rem; border-left: 4px solid #ef4444; }
    .success-msg { color: #065f46; background-color: #d1fae5; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-weight: 500; font-size: 0.95rem; border-left: 4px solid #10b981; }
    .validation-error { color: #ef4444; font-size: 0.85rem; margin-top: 6px; display: flex; align-items: center; gap: 4px; }
  `]
})
export class ReportComplaintComponent implements OnInit {
  @Output() complaintSubmitted = new EventEmitter<void>();

  complaintForm!: FormGroup;
  isSubmitting = false;
  error = '';
  success = '';
  selectedFile: File | null = null;
  isDragging = false;

  categories = ['WiFi', 'Electricity', 'Water', 'Cleaning', 'Furniture', 'Other'];

  constructor(
    private fb: FormBuilder,
    private complaintService: ComplaintService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.complaintForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      // update the underlying input element if needed
      const fileInput = document.getElementById('image') as HTMLInputElement;
      if (fileInput) fileInput.files = event.dataTransfer.files;
    }
  }

  removeFile(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onSubmit() {
    if (this.complaintForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.success = '';

    const formData = new FormData();
    formData.append('title', this.complaintForm.get('title')?.value);
    formData.append('category', this.complaintForm.get('category')?.value);
    formData.append('description', this.complaintForm.get('description')?.value);
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.complaintService.createComplaint(formData).subscribe({
      next: (res) => {
        this.success = 'Problem reported successfully!';
        this.complaintForm.reset();
        this.selectedFile = null;
        
        // Reset file input element
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        this.complaintSubmitted.emit();
        this.isSubmitting = false;
        
        // Optional: wait a moment and then route back to dashboard if implemented as a separate page
        // Or trigger an event if embedded. For now just clear form.
        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to submit report. Please try again.';
        this.isSubmitting = false;
        console.error(err);
      }
    });
  }
}
