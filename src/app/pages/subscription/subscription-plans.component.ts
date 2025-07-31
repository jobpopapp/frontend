import { Component, OnInit } from '@angular/core';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

import { CommonModule } from '@angular/common';
import { SubscriptionService, SubscriptionStatusString } from '../../services/subscription.service';
import { BillingService, BillingAddress } from '../../services/billing.service';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/layout/navbar/navbar.component';
import { PesapalIframeComponent } from '../../components/pesapal-iframe/pesapal-iframe.component';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss'],
  standalone: true,
  imports: [CommonModule, SidebarComponent, NavbarComponent, SafeUrlPipe]
})
export class SubscriptionPlansComponent implements OnInit {

  isPlanType(id: string): 'monthly' | 'annual' | 'per_job' {
    if (id === 'monthly' || id === 'annual' || id === 'per_job') {
      return id as 'monthly' | 'annual' | 'per_job';
    }
    return 'monthly'; // fallback
  }

  isStatusObject(): boolean {
    return !!(
      this.subscriptionStatus &&
      typeof this.subscriptionStatus === 'object' &&
      'is_active' in this.subscriptionStatus
    );
  }

  getStatusField(field: string): any {
    return this.isStatusObject() ? (this.subscriptionStatus as any)[field] : undefined;
  }
  plans: any[] = [];
  loading: { [key: string]: boolean } = {};
  isProcessing = false;
  error: string | null = null;
  billingAddress: BillingAddress | null = null;
  billingMissing: boolean = false;
  subscriptionStatus: SubscriptionStatusString | null = null;
  pesapalRedirectUrl: string | null = null;

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

    // Fetch subscription status
    this.subscriptionService.getSubscriptionStatus().subscribe({
      next: (status) => {
        this.subscriptionStatus = status;
        console.log('[SubscriptionPlansComponent] Subscription Status:', status);
      },
      error: (err) => {
        console.error('[SubscriptionPlansComponent] Error fetching subscription status:', err);
        this.subscriptionStatus = null; // Or set a default inactive status
      }
    });
  }

  subscribe(planId: 'monthly' | 'annual' | 'per_job') {
    if (this.billingMissing) {
      this.router.navigate(['/billing-address']);
      return;
    }

    this.loading[planId] = true;
    this.isProcessing = true;
    this.error = null;

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
      next: (response: any) => {
        console.log('[SubscriptionPlansComponent] Full payment response:', response);
        this.loading[planId] = false;
        this.isProcessing = false;
        const redirectUrl = response?.redirect_url;
        console.log('[SubscriptionPlansComponent] Extracted redirectUrl:', redirectUrl);
        if (redirectUrl) {
          console.log('Setting pesapalRedirectUrl to:', redirectUrl);
          this.pesapalRedirectUrl = redirectUrl;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Payment Error',
            text: 'No payment redirect URL received from server.'
          });
        }
      },
      error: (error) => {
        this.loading[planId] = false;
        this.isProcessing = false;
        let errorMsg = 'There was an error submitting your payment.';
        if (error && error.error && error.error.error && error.error.error.message) {
          errorMsg = error.error.error.message;
        } else if (error && error.message) {
          errorMsg = error.message;
        }
        Swal.fire({
          icon: 'error',
          title: 'Payment Error',
          text: errorMsg
        });
      }
    });
  }
}
