import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { NavbarComponent } from '../../components/layout/navbar/navbar.component';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { Company, Job, DashboardStats } from '../../core/interfaces';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, TitleCasePipe, NavbarComponent, SidebarComponent],
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
          this.subscriptionStatus = response.data.hasActiveSubscription ? 'active' : 
                                   response.data.isExpired ? 'expired' : 'none';
          this.subscriptionDaysLeft = response.data.daysLeft || 0;
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
    // TODO: Implement file upload modal for certificate
    alert('Certificate upload feature will be implemented in the next phase');
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}
