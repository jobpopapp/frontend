import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid mt-4">
      <h2>Analytics Overview</h2>

      <div *ngIf="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>Loading analytics...</p>
      </div>

      <div *ngIf="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <div *ngIf="!loading && !error" class="row">
        <div class="col-md-4 mb-4">
          <div class="card text-center p-3 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Total Companies</h5>
              <p class="card-text display-4">{{ analytics.totalCompanies }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card text-center p-3 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Active Subscribers</h5>
              <p class="card-text display-4">{{ analytics.activeSubscribers }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card text-center p-3 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Inactive Subscribers</h5>
              <p class="card-text display-4">{{ analytics.inactiveSubscribers }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './admin-analytics.component.scss'
})
export class AdminAnalyticsComponent implements OnInit {
  analytics = {
    totalCompanies: 0,
    activeSubscribers: 0,
    inactiveSubscribers: 0
  };
  subscriptionPlanAnalytics: { plan_type: string; count: number; }[] = []; // Supabase RPC returns 'count' for aggregate functions
  loading = true;
  error: string | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadAnalytics();
    this.loadSubscriptionPlanAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.adminService.getAnalytics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.analytics = response.data;
        } else {
          this.error = response.message || 'Failed to load analytics.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'An error occurred while fetching analytics.';
        this.loading = false;
      }
    });
  }

  loadSubscriptionPlanAnalytics(): void {
    this.adminService.getSubscriptionPlanAnalytics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          console.log("Frontend received subscription plan analytics:", response.data);
          this.subscriptionPlanAnalytics = [...response.data]; // Force re-render by creating a new array reference
        } else {
          // Handle error for this specific analytics call if needed
          console.error('Failed to load subscription plan analytics:', response.message);
        }
      },
      error: (err) => {
        console.error('Error fetching subscription plan analytics:', err);
      }
    });
  }
}
