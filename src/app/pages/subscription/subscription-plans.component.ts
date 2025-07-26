
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../core/services/subscription.service';
import { BillingService, BillingAddress } from '../../services/billing.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class SubscriptionPlansComponent implements OnInit {
  asPlanType(id: string): 'monthly' | 'annual' | 'per_job' {
    if (id === 'monthly' || id === 'annual' || id === 'per_job') {
      return id as 'monthly' | 'annual' | 'per_job';
    }
    return 'monthly'; // fallback
  }
  plans: any[] = [];
  loading: { [key: string]: boolean } = {};
  isProcessing = false;
  error: string | null = null;
  billingAddress: BillingAddress | null = null;
  billingMissing: boolean = false;

  constructor(
    private subscriptionService: SubscriptionService,
    private billingService: BillingService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('=== SubscriptionPlansComponent ngOnInit called ===');
    this.billingService.getBillingAddress().subscribe({
      next: (address) => {
        this.billingAddress = address;
        this.billingMissing = !address || !address.email_address || !address.first_name || !address.last_name;
      },
      error: (err) => {
        this.billingMissing = true;
      }
    });

    console.log('Fetching subscription plans from backend...');
    this.subscriptionService.getPlans().subscribe({
      next: (response) => {
        // Always log the full response
        console.log('[SubscriptionPlansComponent] API /subscription/plans response:', response);
        let plansData: any[] = [];
        if (response && response.success && Array.isArray(response.data)) {
          plansData = response.data;
        } else if (response && Array.isArray(response.data)) {
          plansData = response.data;
        } else if (Array.isArray(response)) {
          plansData = response;
        } else {
          console.warn('[SubscriptionPlansComponent] Unrecognized plans response format:', response);
        }
        this.plans = plansData.map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features : []
        }));
        // Log the final plans array
        console.log('[SubscriptionPlansComponent] Final plans array:', this.plans);
        console.log('[SubscriptionPlansComponent] Plans count:', this.plans.length);
      },
      error: (err) => {
        console.error('[SubscriptionPlansComponent] Error fetching plans:', err);
        this.error = 'Failed to load subscription plans.';
        this.plans = [];
      }
    });
  }

  subscribe(planId: 'monthly' | 'annual' | 'per_job') {
    if (this.billingMissing) {
      this.router.navigate(['/billing-address']);
      return;
    }

    this.loading[planId] = true;
    this.isProcessing = true; // Show the processing modal

    const selectedPlan = this.plans.find(p => p.id === planId);
    if (!selectedPlan) {
      this.error = 'Invalid plan selected.';
      this.loading[planId] = false;
      this.isProcessing = false;
      return;
    }

    const payload = {
      planType: planId,
      amount: selectedPlan.price,
      currency: selectedPlan.currency
    };

    this.subscriptionService.initiatePayment(payload).subscribe({
      next: (response) => {
        if (response && response.success && response.data && response.data.subscription) {
          // Subscription activated successfully
          this.error = null;
          this.loading[planId] = false;
          this.isProcessing = false;
          // Show success message or redirect to dashboard
          alert('Subscription activated successfully!');
          this.router.navigate(['/dashboard']);
        } else {
          this.error = response?.message || 'Subscription activation failed.';
          this.loading[planId] = false;
          this.isProcessing = false;
        }
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to activate subscription. Please try again.';
        this.loading[planId] = false;
        this.isProcessing = false;
      }
    });
  }
}
