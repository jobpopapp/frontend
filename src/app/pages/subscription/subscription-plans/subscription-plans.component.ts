import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubscriptionService } from '../../../core/services/subscription.service';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  priceText: string;
  durationText: string;
}

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-plans.component.html',
  styleUrl: './subscription-plans.component.scss'
})
export class SubscriptionPlansComponent implements OnInit {
  plans: SubscriptionPlan[] = [
    {
      id: 'per_job',
      name: 'Per Job',
      price: 30,
      duration: '1 job',
      description: 'Perfect for occasional hiring needs',
      priceText: '$30',
      durationText: 'per job posting',
      features: [
        'Post 1 job',
        'Job visible for 30 days',
        'Basic support',
        'Standard job categories',
        'Email notifications'
      ]
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: 50,
      duration: '30 days',
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
      duration: '365 days',
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

  isLoading = false;
  selectedPlan: string | null = null;

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is verified before showing subscription plans
    this.checkVerificationStatus();
  }

  checkVerificationStatus() {
    // This would typically check with the auth service
    // For now, we'll assume the user can view plans
  }

  selectPlan(planId: string) {
    this.selectedPlan = planId;
  }

  subscribeToPlan(plan: SubscriptionPlan) {
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

  calculateMonthlySavings(): number {
    const monthlyPrice = 50;
    const annualMonthlyEquivalent = 500 / 12;
    return Math.round((monthlyPrice - annualMonthlyEquivalent) * 12);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
