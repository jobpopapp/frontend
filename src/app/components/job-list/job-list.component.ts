import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { Job, JobCategory } from '../../core/interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss'
})
export class JobListComponent implements OnInit {
  @Input() jobCategories: JobCategory[] = [];

  getCategoryLabel(category: { id: string; name: string } | string | number | undefined): string {
    if (!category) return '';

    let categoryId: string | number;
    if (typeof category === 'object' && category.id) {
      categoryId = category.id;
    } else if (typeof category === 'string' || typeof category === 'number') {
      categoryId = category;
    } else {
      return '';
    }

    const found = this.jobCategories.find(cat => String(cat.id) === String(categoryId) || cat.name === categoryId);
    return found ? found.name : (typeof categoryId === 'string' ? categoryId : '');
  }
  @Input() jobs: Job[] = [];
  @Output() jobAction = new EventEmitter<{action: string, jobId: string, job?: Job}>();
  @Output() createJob = new EventEmitter<void>();

  // Filter properties
  searchTerm: string = '';
  statusFilter: string = '';
  typeFilter: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 9;
  
  // Filtered and paginated data
  filteredJobs: Job[] = [];
  allJobs: Job[] = [];
  totalJobs: number = 0;
  totalPages: number = 0;
  
  isLoading: boolean = false;

  constructor(
    private jobService: JobService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading = true;
    this.jobService.getCompanyJobs().subscribe({
      next: (response: any) => {
        this.allJobs = (response.data || response || []).map((job: any) => ({
          ...job,
          category: job.categories,
          expires_at: job.expires_at || job.deadline // Use deadline if expires_at is not present
        }));
        this.jobs = this.allJobs;
        this.filterJobs();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load jobs:', error);
        this.isLoading = false;
      }
    });
  }

  filterJobs(): void {
    let filtered = [...this.allJobs];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        (job.country && job.country.toLowerCase().includes(searchLower)) ||
        (job.description && job.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(job => job.status === this.statusFilter);
    }

    // Apply type filter
    if (this.typeFilter) {
      filtered = filtered.filter(job => job.job_type === this.typeFilter);
    }

    this.totalJobs = filtered.length;
    this.totalPages = Math.ceil(this.totalJobs / this.itemsPerPage);
    
    // Reset to first page if current page is beyond available pages
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredJobs = filtered.slice(startIndex, endIndex);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.currentPage = 1;
    this.filterJobs();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterJobs();
    }
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, this.currentPage - half);
      let end = Math.min(this.totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  getEndIndex(): number {
    return Math.min(this.getStartIndex() + this.itemsPerPage, this.totalJobs);
  }

  // Utility methods
  getJobDescriptionPreview(description: string | undefined): string {
    if (!description) return 'No description available';
    const words = description.split(' ');
    if (words.length > 10) {
      return words.slice(0, 10).join(' ') + '...';
    }
    return description;
  }

  getDaysRemaining(expiresAt: string | undefined): number {
    if (!expiresAt) {
      console.log('getDaysRemaining: expiresAt is undefined or null');
      return 0;
    }
    const expiry = new Date(expiresAt);
    const now = new Date();
    console.log('getDaysRemaining: Expiry Date:', expiry);
    console.log('getDaysRemaining: Current Date:', now);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log('getDaysRemaining: Difference in days:', diffDays);
    return Math.max(0, diffDays);
  }

  getTimeAgo(createdAt: string): string {
    if (!createdAt) return '';
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  }

  // Action methods
  editJob(jobId: string): void {
    this.jobAction.emit({ action: 'edit', jobId });
    this.router.navigate(['/jobs/edit', jobId]);
  }

  viewApplications(jobId: string): void {
    this.jobAction.emit({ action: 'applications', jobId });
    this.router.navigate(['/jobs', jobId, 'applications']);
  }

  viewJobDetails(job: Job): void {
    this.jobAction.emit({ action: 'view', jobId: job.id, job: job });
  }

  duplicateJob(jobId: string): void {
    this.jobAction.emit({ action: 'duplicate', jobId });
    // Implement duplication logic
    this.jobService.duplicateJob(jobId).subscribe({
      next: (response: any) => {
        console.log('Job duplicated successfully');
        this.loadJobs(); // Refresh the list
      },
      error: (error: any) => {
        console.error('Failed to duplicate job:', error);
      }
    });
  }

  deleteJob(jobId: string): void {
    this.jobAction.emit({ action: 'delete', jobId });
    this.jobService.deleteJob(jobId).subscribe({
      next: (response: any) => {
        console.log('Job deleted successfully');
        Swal.fire(
          'Deleted!',
          'Your job has been deleted.',
          'success'
        );
        this.loadJobs(); // Refresh the list
      },
      error: (error: any) => {
        console.error('Failed to delete job:', error);
        Swal.fire(
          'Error!',
          'Failed to delete job.',
          'error'
        );
      }
    });
  }

  confirmDeleteJob(jobId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this job!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteJob(jobId);
      }
    });
  }

  createNewJob(): void {
    this.createJob.emit();
    this.router.navigate(['/jobs/new']);
  }

  /**
   * Utility to ensure job payload includes required fields for backend validation
   * Replace phone with contact_phone and add company_website as optional (default 'NULL')
   */
  prepareJobPayload(job: any): any {
    return {
      ...job,
      contact_phone: job.contact_phone || job.phone || '',
      company_website: job.company_website || '',
      phone: undefined // Remove old phone field if present
    };
  }

  
}
