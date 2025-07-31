import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Subscription } from '../../../core/interfaces';
import { Company } from '../../../core/interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Output() navigationChange = new EventEmitter<string>();
  @Input() isAdminDashboard: boolean = false; // New input property
  
  currentCompany: Company | null = null;
  isJobsMenuOpen = false;
  subscriptionStatus: 'active' | 'expired' | 'none' = 'none';
  daysLeft = 0;
  private currentSubscription: Subscription | null = null;
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

    // Load subscription status only for non-admin dashboard
    if (!this.isAdminDashboard) {
      this.loadSubscriptionStatus();
    }
  }

  toggleJobsMenu(event: Event): void {
    event.preventDefault();
    this.isJobsMenuOpen = !this.isJobsMenuOpen;
  }

  viewProfile(): void {
    if (this.currentCompany) {
      const company = this.currentCompany;
      Swal.fire({
        title: '<strong style="font-size: 1.5rem; color: #333;">Company Profile</strong>',
        icon: 'info',
        html: `
          <div style="text-align: left; padding: 1rem;">
            <p style="font-size: 1rem; color: #555;">
              Here are your company details:
            </p>
            <hr style="margin: 1.5rem 0;">
            <table class="table table-bordered table-striped">
              <tbody>
                <tr>
                  <th>Name</th>
                  <td>${company.name || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td><a href="mailto:${company.email}">${company.email || 'N/A'}</a></td>
                </tr>
                <tr>
                  <th>Phone</th>
                  <td><a href="https://wa.me/${company.phone}" target="_blank">${company.phone || 'N/A'}</a></td>
                </tr>
                <tr>
                  <th>Country</th>
                  <td>${company.country || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Verified</th>
                  <td>${company.is_verified ? 'Yes' : 'No'}</td>
                </tr>
                ${company.certificate_url ? `
                <tr>
                  <th>Certificate</th>
                  <td><a href="${company.certificate_url}" target="_blank">View Certificate</a></td>
                </tr>
                ` : ''}
                <tr>
                  <th>Created At</th>
                  <td>${new Date(company.created_at).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <th>Updated At</th>
                  <td>${new Date(company.updated_at).toLocaleDateString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `,
        showCloseButton: true,
        showConfirmButton: false,
        focusConfirm: false,
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
          htmlContainer: 'custom-swal-html-container'
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Profile Not Available',
        text: 'Company profile data is not loaded yet.',
        confirmButtonColor: '#3085d6'
      });
    }
  }

  viewSettings(): void {
    this.router.navigate(['/settings']);
  }

  openSupport(): void {
    Swal.fire({
      title: '<strong style="font-size: 1.5rem; color: #333;">Contact Support</strong>',
      icon: 'info',
      html: `
        <div style="text-align: left; padding: 1rem;">
          <p style="font-size: 1rem; color: #555;">
            For any questions, issues, or feedback, please reach out to our support team. We're here to help!
          </p>
          <hr style="margin: 1.5rem 0;">
          <div style="display: flex; align-items: center; margin-bottom: 1rem;">
            <i class="bi bi-envelope-fill" style="font-size: 1.5rem; color: #007bff; margin-right: 1rem;"></i>
            <a href="mailto:jobpopapp@gmail.com" style="font-size: 1rem; color: #007bff; text-decoration: none;">
              jobpopapp@gmail.com
            </a>
          </div>
          <div style="display: flex; align-items: center;">
            <i class="bi bi-whatsapp" style="font-size: 1.5rem; color: #25D366; margin-right: 1rem;"></i>
            <a href="https://wa.me/256773913902" target="_blank" style="font-size: 1rem; color: #25D366; text-decoration: none;">
              +256 773 913 902
            </a>
          </div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      focusConfirm: false,
      customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        htmlContainer: 'custom-swal-html-container'
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirect to login page after logout
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
        if (status && typeof status.is_active === 'boolean') {
          const now = new Date();
          const endDate = new Date(status.end_date);
          this.daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          if (status.is_active && endDate > now) {
            this.subscriptionStatus = 'active';
          } else if (endDate <= now) {
            this.subscriptionStatus = 'expired';
          } else {
            this.subscriptionStatus = 'none';
          }
        } else {
          this.subscriptionStatus = 'none';
          this.daysLeft = 0;
        }
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
    this.router.navigate(['/dashboard'], { queryParams: { view: 'jobs' } });
  }

  navigateToJobForm(): void {
    this.router.navigate(['/jobs/new']);
  }

  navigateToSubscription(): void {
    this.router.navigate(['/subscription']);
  }

  navigateToProfile(): void {
    this.navigateTo('profile');
  }

  navigateToVerification(): void {
    this.navigateTo('verification');
  }

  refreshSubscription(): void {
    if (this.currentCompany) {
      Swal.fire({
        title: 'Refreshing...',
        text: 'Please wait while we update your subscription status.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.subscriptionService.refreshSubscription(this.currentCompany.id).subscribe({
        next: (result: any) => {
          this.loadSubscriptionStatus();
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: 'Subscription status refreshed',
            showConfirmButton: false,
            timer: 1500
          });
        },
        error: (err: any) => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error refreshing subscription',
            text: err.error.error,
          });
        }
      });
    }
  }
}
