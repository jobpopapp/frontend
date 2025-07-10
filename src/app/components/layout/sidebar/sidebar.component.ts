import { Component, OnInit } from '@angular/core';
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
      next: (response) => {
        if (response.success && response.data) {
          this.subscriptionStatus = response.data.hasActiveSubscription ? 'active' : 
                                   response.data.isExpired ? 'expired' : 'none';
          this.daysLeft = response.data.daysLeft || 0;
        }
      },
      error: (error) => {
        console.error('Error loading subscription status:', error);
        // Set default values
        this.subscriptionStatus = 'none';
        this.daysLeft = 0;
      }
    });
  }
}
