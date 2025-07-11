import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { NavbarComponent } from '../../components/layout/navbar/navbar.component';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { AccountVerificationComponent } from '../../components/account-verification/account-verification.component';
import { JobListComponent } from '../../components/job-list/job-list.component';
import { JobFormComponent } from '../../components/job-form/job-form.component';
import { Company, Job, DashboardStats } from '../../core/interfaces';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, TitleCasePipe, NavbarComponent, SidebarComponent, AccountVerificationComponent, JobListComponent, JobFormComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentCompany: Company | null = null;
  recentJobs: Job[] = [];
  dashboardStats: DashboardStats = {
    totalJobs: 0,
    activeJobs: 0,
    expiredJobs: 0,
    totalApplications: 0,
    subscriptionStatus: 'none'
  };
  subscriptionStatus: 'active' | 'expired' | 'none' = 'none';
  subscriptionDaysLeft = 0;
  isVerified = false;
  isLoading = true;

  // Navigation state for dynamic content loading
  currentView: string = 'overview'; // overview, jobs, verification, subscription, profile

  // Subscription Plans Data
  subscriptionPlans = [
    {
      id: 'per_job',
      name: 'Per Job',
      price: 30,
      description: 'Perfect for occasional hiring needs',
      priceText: '$30',
      durationText: 'per job posting',
      features: [
        'Post 1 job',
        'Job visible for 30 days',
        'Basic support',
        'Standard job categories'
      ]
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: 50,
      description: 'Great for growing companies',
      priceText: '$50',
      durationText: 'per month',
      popular: true,
      features: [
        'Unlimited job postings',
        'Priority job placement',
        'Advanced analytics',
        'Premium support',
        'Custom job categories',
        'Extended job visibility',
        'Bulk job management'
      ]
    },
    {
      id: 'annual',
      name: 'Annual',
      price: 500,
      description: 'Best value for established companies',
      priceText: '$500',
      durationText: 'per year',
      features: [
        'Everything in Monthly',
        '2 months free (save $100)',
        'Dedicated account manager',
        'Custom branding options',
        'Priority customer support',
        'Advanced reporting',
        'API access (coming soon)'
      ]
    }
  ];

  selectedPlan: string | null = null;

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    // Get current company
    this.authService.currentCompany$.subscribe(company => {
      this.currentCompany = company;
      this.isVerified = company?.is_verified || false;
    });

    // Load recent jobs
    this.jobService.getJobs(1, 5).subscribe({
      next: (response) => {
        if (response.success) {
          this.recentJobs = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error loading recent jobs:', error);
      }
    });

    // Load job statistics
    this.jobService.getJobStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dashboardStats = {
            totalJobs: response.data.total,
            activeJobs: response.data.active,
            expiredJobs: response.data.expired,
            totalApplications: 0, // Will be implemented when applications feature is added
            subscriptionStatus: this.subscriptionStatus
          };
        }
      },
      error: (error) => {
        console.error('Error loading job stats:', error);
      }
    });

    // Load subscription status
    this.subscriptionService.getSubscriptionStatus().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Map the correct field names from backend
          const isActive = response.data.isActive || false;
          const daysRemaining = response.data.daysRemaining || 0;
          const status = response.data.status || 'none';
          
          // Determine subscription status based on backend response
          if (isActive && status === 'active') {
            this.subscriptionStatus = 'active';
          } else if (status === 'expired') {
            this.subscriptionStatus = 'expired';
          } else {
            this.subscriptionStatus = 'none';
          }
          
          this.subscriptionDaysLeft = daysRemaining;
          this.dashboardStats.subscriptionStatus = this.subscriptionStatus;
        }
      },
      error: (error) => {
        console.error('Error loading subscription status:', error);
        // Set default values
        this.subscriptionStatus = 'none';
        this.subscriptionDaysLeft = 0;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
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
  }

  onVerificationComplete(): void {
    this.currentView = 'overview';
    this.isVerified = true;
    
    // Refresh company data from the auth service
    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.isVerified = response.data.is_verified || false;
          this.currentCompany = response.data;
        }
      },
      error: (error) => {
        console.error('Error refreshing company data:', error);
      }
    });
    
    // Refresh dashboard data
    this.loadDashboardData();
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  // Job action handler
  onJobAction(event: {action: string, jobId: string}): void {
    console.log('Job action:', event);
    // Handle different job actions
    switch (event.action) {
      case 'edit':
        this.navigateToView('job-form');
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
    this.selectedPlan = plan.id;

    // Prepare payment data for Pesapal
    const paymentData = {
      plan_type: plan.id as 'monthly' | 'annual' | 'per_job',
      amount: plan.price,
      currency: 'USD'
    };

    // Call subscription service to initiate Pesapal payment
    this.subscriptionService.initiatePayment(paymentData)
      .subscribe({
        next: (response: any) => {
          // Redirect to Pesapal payment page
          if (response.data?.payment_url) {
            window.location.href = response.data.payment_url;
          }
        },
        error: (error: any) => {
          console.error('Payment initiation failed:', error);
          this.isLoading = false;
          this.selectedPlan = null;
          // Show error message to user
        }
      });
  }
}
