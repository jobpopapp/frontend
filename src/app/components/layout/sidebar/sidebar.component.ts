import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Company } from '../../../core/interfaces';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Output() navigationChange = new EventEmitter<string>();
  
  currentCompany: Company | null = null;
  isJobsMenuOpen = false;
  subscriptionStatus: 'active' | 'expired' | 'none' = 'none';
  daysLeft = 0;
  isVerified = false;

  constructor(
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current company
    this.authService.currentCompany$.subscribe(company => {
      this.currentCompany = company;
      this.isVerified = company?.is_verified || false;
    });

    // Load subscription status
    this.loadSubscriptionStatus();
  }

  toggleJobsMenu(event: Event): void {
    event.preventDefault();
    this.isJobsMenuOpen = !this.isJobsMenuOpen;
  }

  viewProfile(): void {
    this.router.navigate(['/profile']);
  }

  viewSettings(): void {
    this.router.navigate(['/settings']);
  }

  openSupport(): void {
    // Open support modal or navigate to support page
    alert('Support feature will be implemented in the next phase');
  }

  logout(): void {
    this.authService.logout();
  }

  getSubscriptionStatusClass(): string {
    switch (this.subscriptionStatus) {
      case 'active':
        return this.daysLeft <= 7 ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success';
      case 'expired':
        return 'bg-danger-subtle text-danger';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }

  getSubscriptionIcon(): string {
    switch (this.subscriptionStatus) {
      case 'active':
        return this.daysLeft <= 7 ? 'bi-exclamation-triangle' : 'bi-check-circle';
      case 'expired':
        return 'bi-x-circle';
      default:
        return 'bi-info-circle';
    }
  }

  getSubscriptionText(): string {
    switch (this.subscriptionStatus) {
      case 'active':
        return this.daysLeft <= 7 ? 'Expiring Soon' : 'Active Plan';
      case 'expired':
        return 'Plan Expired';
      default:
        return 'No Active Plan';
    }
  }

  private loadSubscriptionStatus(): void {
    this.subscriptionService.getSubscriptionStatus().subscribe({
      next: (status) => {
        this.subscriptionStatus = status;
        // Optionally, fetch daysLeft separately if needed
      },
      error: (error) => {
        console.error('Error loading subscription status:', error);
        this.subscriptionStatus = 'none';
        this.daysLeft = 0;
      }
    });
  }

  // Navigation methods for SPA
  navigateTo(view: string): void {
    this.navigationChange.emit(view);
  }

  navigateToOverview(): void {
    this.navigateTo('overview');
  }

  navigateToJobs(): void {
    this.navigateTo('jobs');
  }

  navigateToJobForm(): void {
    this.navigateTo('job-form');
  }

  navigateToSubscription(): void {
    this.navigateTo('subscription');
  }

  navigateToProfile(): void {
    this.navigateTo('profile');
  }

  navigateToVerification(): void {
    this.navigateTo('verification');
  }
}
