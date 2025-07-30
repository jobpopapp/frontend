import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { NavbarComponent } from '../../components/layout/navbar/navbar.component';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import {
  AccountVerificationComponent
} from '../../components/account-verification/account-verification.component';
import { JobListComponent } from '../../components/job-list/job-list.component';
import { JobFormComponent } from '../../components/job-form/job-form.component';
import { JobDetailModalComponent } from '../../components/job-detail-modal/job-detail-modal.component';
import { Company, Job, DashboardStats, JobCategory } from '../../core/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TitleCasePipe,
    NavbarComponent,
    SidebarComponent,
    AccountVerificationComponent,
    JobListComponent,
    JobFormComponent,
    JobDetailModalComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  currentCompany: Company | null = null;
  recentJobs: Job[] = [];
  jobCategories: JobCategory[] = [];
  dashboardStats: DashboardStats = {
    totalJobs: 0,
    activeJobs: 0,
    expiredJobs: 0,
    totalApplications: 0,
    subscriptionStatus: 'none',
  };
  subscriptionStatus: 'active' | 'expired' | 'none' = 'none';
  subscriptionDaysLeft = 0;
  isVerified = false;
  isLoading = true;
  paymentStatus: string | null = null;
  selectedPlan: string | null = null;
  error: string | null = null;
  isProcessing: boolean = false;

  // Navigation state for dynamic content loading
  currentView: string = 'overview'; // overview, jobs, verification, subscription, profile

  // Job Detail Modal properties
  isJobDetailModalVisible: boolean = false;
  selectedJobForModal: Job | null = null;

  // Subscription Plans Data
  subscriptionPlans: any[] = [];

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private subscriptionService: SubscriptionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.paymentStatus = params['payment'];
      if (params['view']) {
        this.currentView = params['view'];
        if (this.currentView === 'jobs') {
          this.jobService.getJobs(1, 100).subscribe({
            next: response => {
              if (response.success) {
                this.recentJobs = response.data || [];
              }
            },
            error: error => {
              console.error('Error loading jobs for job management view:', error);
            }
          });
        }
      }
    });
    this.loadDashboardData();
    this.subscriptionService.getPlans().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Ensure plans is always an array and features are arrays
          const plansData = Array.isArray(response.data) ? response.data : [];
          this.subscriptionPlans = plansData.map(plan => ({
            ...plan,
            features: Array.isArray(plan.features) ? plan.features : []
          }));
        } else {
          this.subscriptionPlans = [];
        }
      },
      error: (err) => {
        console.error('Error loading subscription plans:', err);
        this.subscriptionPlans = [];
      }
    });
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    // Get current company
    this.authService.currentCompany$.subscribe(company => {
      this.currentCompany = company;
      this.isVerified = company?.is_verified || false;
    });

    // Load job categories
    this.jobService.getCategories().subscribe({
      next: response => {
        if (response.success && Array.isArray(response.data)) {
          this.jobCategories = response.data;
        } else {
          this.jobCategories = [];
        }
      },
      error: error => {
        console.error('Error loading job categories:', error);
        this.jobCategories = [];
      },
    });
    // Load recent jobs
    this.jobService.getJobs(1, 5).subscribe({
      next: response => {
        if (response.success) {
          this.recentJobs = response.data || [];
        }
      },
      error: error => {
        console.error('Error loading recent jobs:', error);
      },
    });

    // Load job statistics
    this.jobService.getJobStats().subscribe({
      next: response => {
        if (response.success && response.data) {
          this.dashboardStats = {
            totalJobs: response.data.total,
            activeJobs: response.data.active,
            expiredJobs: response.data.expired,
            totalApplications: 0, // Will be implemented when applications feature is added
            subscriptionStatus: this.subscriptionStatus,
          };
        }
      },
      error: error => {
        console.error('Error loading job stats:', error);
      },
    });

    // Load subscription status and days left from /subscription/status
    this.subscriptionService.getSubscriptionStatus().subscribe({
      next: (status) => {
        if (status && typeof status.is_active === 'boolean') {
          const now = new Date();
          const endDate = new Date(status.end_date);
          this.subscriptionDaysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          if (status.is_active && endDate > now) {
            this.subscriptionStatus = 'active';
          } else if (endDate <= now) {
            this.subscriptionStatus = 'expired';
          } else {
            this.subscriptionStatus = 'none';
          }
        } else {
          this.subscriptionStatus = 'none';
          this.subscriptionDaysLeft = 0;
        }
        this.dashboardStats.subscriptionStatus = this.subscriptionStatus;
      },
      error: (error) => {
        console.error('Error loading subscription status:', error);
        this.subscriptionStatus = 'none';
        this.subscriptionDaysLeft = 0;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (isNaN(diffInHours)) return '';
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      } else {
        const diffInWeeks = Math.floor(diffInDays / 7);
        return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
      }
    }
  }

  openUploadModal(): void {
    this.navigateToView('verification');
  }

  // Navigation methods for dynamic content loading
  navigateToView(view: string): void {
    this.currentView = view;
    if (view === 'jobs') {
      this.jobService.getJobs(1, 100).subscribe({
        next: response => {
          if (response.success) {
            this.recentJobs = response.data || [];
          }
        },
        error: error => {
          console.error('Error loading jobs for job management view:', error);
        }
      });
    }
  }

  onVerificationComplete(): void {
    this.currentView = 'overview';
    this.isVerified = true;

    // Refresh company data from the auth service
    this.authService.getProfile().subscribe({
      next: response => {
        if (response.success && response.data) {
          this.isVerified = response.data.is_verified || false;
          this.currentCompany = response.data;
        }
      },
      error: error => {
        console.error('Error refreshing company data:', error);
      },
    });

    // Refresh dashboard data
    this.loadDashboardData();
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  // Job action handler
  onJobAction(event: { action: string; jobId: string; job?: Job }): void {
    console.log('Job action:', event);
    // Handle different job actions
    switch (event.action) {
      case 'edit':
        this.navigateToView('job-form');
        break;
      case 'view':
        if (event.job) {
          this.openJobDetailModal(event.job);
        }
        break;
      case 'applications':
        // Navigate to applications view
        console.log('View applications for job:', event.jobId);
        break;
      case 'duplicate':
        // Job duplication is handled in the job list component
        break;
      case 'delete':
        // Job deletion is handled in the job list component
        this.loadDashboardData(); // Refresh dashboard after deletion
        break;
    }
  }

  // Subscription Plans Methods
  subscribeToPlan(plan: any): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.isProcessing = true;
    this.selectedPlan = plan.id;
    this.error = null;

    // Prepare payment data for Pesapal
    const paymentData = {
      planType: plan.id as 'monthly' | 'annual' | 'per_job',
      amount: plan.price,
      currency: plan.currency || 'UGX',
    };

    // Call subscription service to initiate subscription
    this.subscriptionService.initiatePayment(paymentData).subscribe({
      next: (response: any) => {
        if (response.success && response.data?.subscription) {
          // Subscription activated successfully
          this.subscriptionStatus = 'active';
          this.selectedPlan = null;
          this.isLoading = false;
          this.isProcessing = false;
          this.dashboardStats.subscriptionStatus = 'active';
        } else {
          // Show error message from backend
          this.error = response?.message || 'Subscription activation failed.';
          this.isLoading = false;
          this.isProcessing = false;
          this.selectedPlan = null;
        }
      },
      error: (error: any) => {
        this.error = error?.error?.message || 'Failed to activate subscription. Please try again.';
        this.isLoading = false;
        this.isProcessing = false;
        this.selectedPlan = null;
      },
    });
  }

  // Job Detail Modal methods
  openJobDetailModal(job: Job): void {
    this.selectedJobForModal = job;
    this.isJobDetailModalVisible = true;
  }

  closeJobDetailModal(): void {
    this.isJobDetailModalVisible = false;
    this.selectedJobForModal = null;
  }
}
