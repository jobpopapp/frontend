import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { SubscriptionService } from '../../../core/services/subscription.service'; // Import SubscriptionService
import { SubscriptionPlan } from '../../../core/interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-subscription-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-subscription-plans.component.html',
  styleUrl: './admin-subscription-plans.component.scss'
})
export class AdminSubscriptionPlansComponent implements OnInit {
  plans: SubscriptionPlan[] = [];
  newPlan: Partial<SubscriptionPlan> = { popular: false, features: [] }; // Initialize popular
  editingPlan: Partial<SubscriptionPlan> | null = null;
  loading = true;
  error: string | null = null;

  constructor(private adminService: AdminService, private subscriptionService: SubscriptionService) { }

  ngOnInit(): void {
    console.log('[AdminSubscriptionPlansComponent] ngOnInit called');
    this.loadPlans();
  }

  get currentFormPlan(): Partial<SubscriptionPlan> {
    return this.editingPlan || this.newPlan;
  }

  get featuresString(): string {
    return this.currentFormPlan.features ? this.currentFormPlan.features.join(', ') : '';
  }

  set featuresString(value: string) {
    this.currentFormPlan.features = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  loadPlans(): void {
    console.log('[AdminSubscriptionPlansComponent] loadPlans called');
    this.loading = true;
    this.subscriptionService.getPlans().subscribe({
      next: (response) => {
        console.log('[AdminSubscriptionPlansComponent] getPlans response:', response);
        if (response.success && response.data) {
          this.plans = response.data.map(plan => ({ ...plan, popular: plan.is_popular })); // Map is_popular to popular
        } else {
          this.error = response.message || 'Failed to load plans.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('[AdminSubscriptionPlansComponent] getPlans error:', err);
        this.error = err.message || 'An error occurred while fetching plans.';
        this.loading = false;
      }
    });
  }

  createPlan(): void {
    if (!this.newPlan.name || !this.newPlan.price || !this.newPlan.currency) {
      Swal.fire('Error', 'Please fill in all required fields.', 'error');
      return;
    }
    const planToSend = { ...this.newPlan, is_popular: this.newPlan.popular }; // Map popular to is_popular
    this.adminService.createSubscriptionPlan(planToSend as SubscriptionPlan).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire('Created!', 'Plan created successfully.', 'success');
          this.newPlan = { popular: false, features: [] }; // Clear form
          this.loadPlans();
        } else {
          Swal.fire('Error', response.message || 'Failed to create plan.', 'error');
        }
      },
      error: (err) => {
        Swal.fire('Error', err.message || 'An error occurred.', 'error');
      }
    });
  }

  editPlan(plan: SubscriptionPlan): void {
    this.editingPlan = { ...plan, popular: plan.is_popular }; // Map is_popular to popular
  }

  updatePlan(): void {
    if (!this.editingPlan || !this.editingPlan.id) return;
    const planToSend = { ...this.editingPlan, is_popular: this.editingPlan.popular }; // Map popular to is_popular
    this.adminService.updateSubscriptionPlan(this.editingPlan.id, planToSend).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire('Updated!', 'Plan updated successfully.', 'success');
          this.editingPlan = null;
          this.loadPlans();
        } else {
          Swal.fire('Error', response.message || 'Failed to update plan.', 'error');
        }
      },
      error: (err) => {
        Swal.fire('Error', err.message || 'An error occurred.', 'error');
      }
    });
  }

  deletePlan(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this plan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteSubscriptionPlan(id).subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire('Deleted!', 'Plan has been deleted.', 'success');
              this.loadPlans();
            } else {
              Swal.fire('Error', response.message || 'Failed to delete plan.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error', err.message || 'An error occurred.', 'error');
          }
        });
      }
    });
  }

  cancelEdit(): void {
    this.editingPlan = null;
  }
}
