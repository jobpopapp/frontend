import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Subscription, SubscriptionPlan, PaymentRequest, ApiResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(private apiService: ApiService) { }

  // Get available subscription plans
  getPlans(): Observable<ApiResponse<SubscriptionPlan[]>> {
    return this.apiService.get<SubscriptionPlan[]>('/subscription/plans');
  }

  // Get current subscription
  getCurrentSubscription(): Observable<ApiResponse<Subscription>> {
    return this.apiService.get<Subscription>('/subscription/current');
  }

  // Get subscription history
  getSubscriptionHistory(): Observable<ApiResponse<Subscription[]>> {
    return this.apiService.get<Subscription[]>('/subscription/history');
  }

  // Initiate payment with Pesapal
  initiatePayment(paymentData: PaymentRequest): Observable<ApiResponse<{
    subscription?: any;
  }>> {
    return this.apiService.post('/subscription/simulate-payment', paymentData);
  }

  // Verify payment status
  verifyPayment(orderTrackingId: string): Observable<ApiResponse<{
    status: string;
    subscription?: Subscription;
  }>> {
    return this.apiService.get(`/subscription/payment/verify/${orderTrackingId}`);
  }

  // Cancel subscription
  cancelSubscription(): Observable<ApiResponse<any>> {
    return this.apiService.post('/subscription/cancel', {});
  }

  // Reactivate subscription
  reactivateSubscription(): Observable<ApiResponse<Subscription>> {
    return this.apiService.post('/subscription/reactivate', {});
  }

  // Get subscription status
  getSubscriptionStatus(): Observable<ApiResponse<{
    subscription?: Subscription;
    status: string;
    isActive: boolean;
    daysRemaining: number;
  }>> {
    return this.apiService.get('/subscription/status');
  }

  // Update auto-renewal setting
  updateAutoRenew(autoRenew: boolean): Observable<ApiResponse<Subscription>> {
    return this.apiService.put('/subscription/auto-renew', { autoRenew });
  }

  // Get payment methods (if implemented)
  getPaymentMethods(): Observable<ApiResponse<any[]>> {
    return this.apiService.get('/subscription/payment-methods');
  }

  // Calculate discount
  calculateDiscount(planType: string): number {
    if (planType === 'annual') {
      const monthlyTotal = 50 * 12; // $600
      const annualPrice = 500;
      return monthlyTotal - annualPrice; // $100 savings
    }
    return 0;
  }

  // Format price
  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  // Get plan by ID
  getPlanById(planId: string): Observable<SubscriptionPlan | null> {
    return this.getPlans().pipe(
      map(response => response.data ? response.data.find(plan => plan.id === planId) || null : null)
    );
  }

  // Check if subscription is active
  isSubscriptionActive(subscription: Subscription): boolean {
    if (!subscription.is_active) return false;
    
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    return endDate > now;
  }

  // Calculate days left in subscription
  getDaysLeft(subscription: Subscription): number {
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  // Get subscription status badge info
  getStatusBadge(subscription: Subscription): { text: string; class: string } {
    if (!subscription.is_active) {
      return { text: 'Inactive', class: 'bg-secondary' };
    }

    const daysLeft = this.getDaysLeft(subscription);
    
    if (daysLeft <= 0) {
      return { text: 'Expired', class: 'bg-danger' };
    } else if (daysLeft <= 7) {
      return { text: 'Expiring Soon', class: 'bg-warning' };
    } else {
      return { text: 'Active', class: 'bg-success' };
    }
  }

  // Get recommended plan
  getRecommendedPlan(): Observable<SubscriptionPlan | null> {
    return this.getPlans().pipe(
      map(response => {
        if (response.data) {
          return response.data.find(plan => plan.popular) || response.data[0] || null;
        }
        return null;
      })
    );
  }
}
