import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../services/complaint.service';

@Component({
  selector: 'app-complaint-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complaint-list.component.html',
  styleUrls: ['./complaint-list.component.css']
})
export class ComplaintListComponent implements OnInit {
  complaints: any[] = [];
  filteredComplaints: any[] = [];
  isLoading = true;
  selectedCategory: string = 'All';

  categories = ['All', 'WiFi', 'Electricity', 'Water', 'Cleaning', 'Furniture', 'Other'];

  constructor(private complaintService: ComplaintService) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints() {
    this.isLoading = true;
    this.complaintService.getComplaints().subscribe({
      next: (data) => {
        this.complaints = data;
        this.applyFilter(); // Initial filter apply
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
}
