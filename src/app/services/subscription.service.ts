import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { environment } from '../../environments/environment'; // Import environment

export type SubscriptionStatusString = 'active' | 'expired' | 'none';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  // Use the full path from the environment file
  private apiUrl = `${environment.apiUrl}/subscription`;

  constructor(private http: HttpClient, private apiService: ApiService) {}

  getPlans(): Observable<any> {
    // Use the full path for all calls
    return this.http.get<any>(`${this.apiUrl}/plans`);
  }

  initiatePayment(payload: { planType: string; amount: number; currency: string }): Observable<any> {
    const token = this.apiService.getToken();
    if (!token) {
      throw new Error('Authentication token not found.');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    // Use the full path for the pesapal endpoint as well
    return this.http.post(`${environment.apiUrl}/pesapal/submit-order`, payload, { headers, responseType: 'json' });
  }

  getSubscriptionStatus(): Observable<SubscriptionStatusString> {
    return this.http.get<any>(`${this.apiUrl}/status`).pipe(
      map(response => {
        const data = response?.data;
        if (data?.is_active) return 'active';
        if (data?.end_date && new Date(data.end_date) < new Date()) return 'expired';
        return 'none';
      })
    );
  }

  verifyPayment(orderTrackingId: string) {
    return this.http.get<any>(`${this.apiUrl}/verify-payment?orderTrackingId=${orderTrackingId}`);
  }

  refreshSubscription(companyId: string): Observable<any> {
    const token = this.apiService.getToken();
    if (!token) {
      throw new Error('Authentication token not found.');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.apiUrl}/refresh`, { company_id: companyId }, { headers });
  }
}
