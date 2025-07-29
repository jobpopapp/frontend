import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { Job, JobCategory } from '../../core/interfaces';

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
  @Output() jobAction = new EventEmitter<{action: string, jobId: string}>();
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
          category: job.category && typeof job.category === 'object'
            ? job.category.id
            : job.category
        }));
        this.jobs = this.allJobs;
        this.filterJobs();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load jobs:', error);
        this.isLoading = false;
        // Set some mock data for demo purposes
        this.allJobs = this.getMockJobs().map((job: any) => ({
          ...job,
          category: job.category && typeof job.category === 'object'
            ? (job.category.id || job.category.name)
            : job.category
        }));
        this.jobs = this.allJobs;
        this.filterJobs();
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
        job.location.toLowerCase().includes(searchLower) ||
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
    if (!expiresAt) return 0;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
    if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      this.jobAction.emit({ action: 'delete', jobId });
      this.jobService.deleteJob(jobId).subscribe({
        next: (response: any) => {
          console.log('Job deleted successfully');
          this.loadJobs(); // Refresh the list
        },
        error: (error: any) => {
          console.error('Failed to delete job:', error);
        }
      });
    }
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

  // Mock data for demo purposes
  private getMockJobs(): Job[] {
    return [
      {
        id: '1',
        title: 'Senior Software Engineer',
        description: 'We are looking for an experienced software engineer to join our growing team. You will be responsible for developing high-quality software solutions and mentoring junior developers.',
        requirements: 'Bachelor\'s degree in Computer Science, 5+ years experience',
        location: 'Nairobi, Kenya',
        job_type: 'full-time',
        category: { id: 'technology', name: 'Technology' },
        salary_range: '$80,000 - $120,000',
        status: 'active',
        featured: true,
        applications_count: 15,
        views_count: 234,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        company_id: '1',
        is_foreign: false
      },
      {
        id: '2',
        title: 'Marketing Manager',
        description: 'Join our marketing team to drive brand awareness and lead generation. Experience with digital marketing and social media campaigns required.',
        requirements: 'Bachelor\'s degree in Marketing, 3+ years experience',
        location: 'Mombasa, Kenya',
        job_type: 'full-time',
        category: { id: 'marketing', name: 'Marketing' },
        salary_range: '$50,000 - $70,000',
        status: 'active',
        featured: false,
        applications_count: 8,
        views_count: 156,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        company_id: '1',
        is_foreign: false
      },
      {
        id: '3',
        title: 'UX/UI Designer',
        description: 'Create amazing user experiences for our web and mobile applications. Strong portfolio and experience with Figma required.',
        requirements: 'Portfolio required, 2+ years experience with design tools',
        location: 'Remote',
        job_type: 'contract',
        category: { id: 'design', name: 'Design' },
        salary_range: '$60,000 - $90,000',
        status: 'active',
        featured: false,
        applications_count: 22,
        views_count: 189,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        company_id: '1',
        is_foreign: false
      },
      {
        id: '4',
        title: 'Data Analyst',
        description: 'Analyze business data to provide insights and support decision-making. Experience with Python, SQL, and visualization tools required.',
        requirements: 'Bachelor\'s degree, Python/SQL skills required',
        location: 'Kisumu, Kenya',
        job_type: 'part-time',
        category: { id: 'analytics', name: 'Analytics' },
        salary_range: '$30,000 - $45,000',
        status: 'expired',
        featured: false,
        applications_count: 12,
        views_count: 98,
        created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        company_id: '1',
        is_foreign: false
      },
      {
        id: '5',
        title: 'Project Manager',
        description: 'Lead cross-functional teams to deliver projects on time and within budget. PMP certification preferred.',
        requirements: 'PMP certification preferred, 3+ years experience',
        location: 'Nakuru, Kenya',
        job_type: 'contract',
        category: { id: 'management', name: 'Management' },
        salary_range: '$70,000 - $100,000',
        status: 'draft',
        featured: false,
        applications_count: 0,
        views_count: 0,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        company_id: '1',
        is_foreign: false
      }
    ];
  }
}
