import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Company, ApiResponse, SubscriptionPlan, Subscription } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private apiService: ApiService) { }

  getCompanies(): Observable<ApiResponse<Company[]>> {
    return this.apiService.get<Company[]>('/admin/companies');
  }

  getCompanyById(id: string): Observable<ApiResponse<Company>> {
    return this.apiService.get<Company>(`/admin/companies/${id}`);
  }

  updateCompanyProfile(id: string, companyData: Partial<Company>): Observable<ApiResponse<Company>> {
    return this.apiService.put<Company>(`/admin/companies/${id}`, companyData);
  }

  updateCompanyVerification(id: string, is_verified: boolean): Observable<ApiResponse<Company>> {
    return this.apiService.put<Company>(`/admin/companies/${id}/verify`, { is_verified });
  }

  deleteCompany(id: string): Observable<ApiResponse<any>> {
    return this.apiService.delete<any>(`/admin/companies/${id}`);
  }

  getAnalytics(): Observable<ApiResponse<{ totalCompanies: number; activeSubscribers: number; inactiveSubscribers: number }>> {
    return this.apiService.get<{
      totalCompanies: number;
      activeSubscribers: number;
      inactiveSubscribers: number;
    }>('/admin/analytics');
  }

  createSubscriptionPlan(plan: SubscriptionPlan): Observable<ApiResponse<SubscriptionPlan>> {
    return this.apiService.post<SubscriptionPlan>('/admin/subscription-plans', plan);
  }

  updateSubscriptionPlan(id: string, plan: Partial<SubscriptionPlan>): Observable<ApiResponse<SubscriptionPlan>> {
    return this.apiService.put<SubscriptionPlan>(`/admin/subscription-plans/${id}`, plan);
  }

  deleteSubscriptionPlan(id: string): Observable<ApiResponse<any>> {
    return this.apiService.delete<any>(`/admin/subscription-plans/${id}`);
  }

  getSubscriptions(): Observable<ApiResponse<Subscription[]>> {
    return this.apiService.get<Subscription[]>('/admin/subscriptions');
  }

  updateSubscription(id: string, subscriptionData: Partial<Subscription>): Observable<ApiResponse<Subscription>> {
    return this.apiService.put<Subscription>(`/admin/subscriptions/${id}`, subscriptionData);
  }
}
