import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Job, JobCreateRequest, JobCategory, ApiResponse, PaginatedResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  constructor(private apiService: ApiService) { }

  // Get all jobs for the company
  getCompanyJobs(): Observable<ApiResponse<Job[]>> {
    return this.apiService.get<Job[]>('/jobs/my');
  }

  // Get all jobs for the company with pagination
  getJobs(page: number = 1, limit: number = 10, filters?: any): Observable<PaginatedResponse<Job>> {
    return this.apiService.getPaginated<Job>('/jobs/my', page, limit, filters);
  }

  // Get single job by ID
  getJob(id: string): Observable<ApiResponse<Job>> {
    return this.apiService.get<Job>(`/jobs/${id}`);
  }

  // Create new job
  createJob(jobData: JobCreateRequest): Observable<ApiResponse<Job>> {
    return this.apiService.post<Job>('/jobs', jobData);
  }

  // Update existing job
  updateJob(id: string, jobData: Partial<JobCreateRequest>): Observable<ApiResponse<Job>> {
    return this.apiService.put<Job>(`/jobs/${id}`, jobData);
  }

  // Delete job
  deleteJob(id: string): Observable<ApiResponse<any>> {
    return this.apiService.delete(`/jobs/${id}`);
  }

  // Get job categories
  getCategories(): Observable<ApiResponse<JobCategory[]>> {
    return this.apiService.get<JobCategory[]>('/jobs/categories');
  }

  // Get job statistics for dashboard
  getJobStats(): Observable<ApiResponse<{
    total: number;
    active: number;
    expired: number;
    draft: number;
  }>> {
    return this.apiService.get('/jobs/stats');
  }

  // Search jobs
  searchJobs(query: string, page: number = 1, limit: number = 10): Observable<PaginatedResponse<Job>> {
    return this.apiService.getPaginated<Job>('/jobs/search', page, limit, { q: query });
  }

  // Toggle job status (active/inactive)
  toggleJobStatus(id: string): Observable<ApiResponse<Job>> {
    return this.apiService.put<Job>(`/jobs/${id}/toggle-status`, {});
  }

  // Duplicate job
  duplicateJob(id: string): Observable<ApiResponse<Job>> {
    return this.apiService.post<Job>(`/jobs/${id}/duplicate`, {});
  }

  // Get job applications (if implemented in backend)
  getJobApplications(jobId: string, page: number = 1, limit: number = 10): Observable<PaginatedResponse<any>> {
    return this.apiService.getPaginated<any>(`/jobs/${jobId}/applications`, page, limit);
  }

  // Export jobs to CSV
  exportJobs(): Observable<Blob> {
    return this.apiService.get<any>('/jobs/export').pipe(
      // Convert response to blob for file download
    ) as any;
  }

  // Get job type options
  getJobTypes(): string[] {
    return ['full-time', 'part-time', 'contract', 'internship'];
  }

  // Validate job data
  validateJobData(jobData: JobCreateRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!jobData.title?.trim()) {
      errors.push('Job title is required');
    }

    if (!jobData.company?.trim()) {
      errors.push('Company name is required');
    }

    if (!jobData.job_description?.trim() && !jobData.description?.trim()) {
      errors.push('Job description is required');
    }

    if (!jobData.country?.trim() && !jobData.location?.trim()) {
      errors.push('Country/Location is required');
    }

    if (!jobData.category?.trim()) {
      errors.push('Category is required');
    }

    if (!jobData.deadline?.trim()) {
      errors.push('Application deadline is required');
    }

    if (jobData.title && jobData.title.length > 100) {
      errors.push('Job title cannot exceed 100 characters');
    }

    const description = jobData.job_description || jobData.description;
    if (description && description.length < 50) {
      errors.push('Job description should be at least 50 characters');
    }

    // Validate deadline is in the future
    if (jobData.deadline) {
      const deadlineDate = new Date(jobData.deadline);
      const today = new Date();
      if (deadlineDate <= today) {
        errors.push('Application deadline must be in the future');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format salary range
  formatSalaryRange(range: string): string {
    if (!range) return 'Not specified';
    
    // Add currency formatting if needed
    const parts = range.split('-');
    if (parts.length === 2) {
      const min = parseInt(parts[0].trim());
      const max = parseInt(parts[1].trim());
      if (!isNaN(min) && !isNaN(max)) {
        return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
      }
    }
    
    return range;
  }

  // Get job status color
  getJobStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'danger';
      case 'draft': return 'warning';
      case 'paused': return 'secondary';
      default: return 'primary';
    }
  }
}
