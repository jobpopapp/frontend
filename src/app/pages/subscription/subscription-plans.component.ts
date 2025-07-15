
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
  plans = [
    { id: 'monthly', name: 'Monthly', price: 40000, features: ['Unlimited jobs', 'Support'], description: 'Pay monthly (UGX).' },
    { id: 'annual', name: 'Annual', price: 400000, features: ['Unlimited jobs', 'Priority support'], description: 'Pay annually and save (UGX).' },
    { id: 'per_job', name: 'Per Job', price: 8000, features: ['Single job post'], description: 'Pay per job post (UGX).' }
  ];
  loading = false;
  error: string | null = null;
  billingAddress: BillingAddress | null = null;
  billingMissing: boolean = false;

  constructor(
    private subscriptionService: SubscriptionService,
    private billingService: BillingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.billingService.getBillingAddress().subscribe({
      next: (address) => {
        this.billingAddress = address;
        // Check if required fields are present
        this.billingMissing = !address || !address.email_address || !address.first_name || !address.last_name;
      },
      error: () => {
        this.billingMissing = true;
      }
    });
  }

  subscribe(planId: 'monthly' | 'annual' | 'per_job') {
    if (this.billingMissing) {
      this.router.navigate(['/billing-address']);
      return;
    }
    this.loading = true;
    // Find selected plan details
    const selectedPlan = this.plans.find(p => p.id === planId);
    if (!selectedPlan) {
      this.error = 'Invalid plan selected.';
      this.loading = false;
      return;
    }
    // Build PaymentRequest payload
    const payload = {
      planType: planId,
      amount: selectedPlan.price,
      currency: 'UGX'
    };
    this.subscriptionService.initiatePayment(payload).subscribe({
      next: (response) => {
        if (response && response.data && response.data.payment_url) {
          window.location.href = response.data.payment_url;
        } else {
          this.error = 'Payment initiation failed: No payment URL received.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Failed to initiate payment. Please ensure your billing address is saved.';
        this.loading = false;
      }
    });
  }
}
