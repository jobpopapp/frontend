import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type SubscriptionStatusString = 'active' | 'expired' | 'none';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private apiUrl = '/api/subscription';

  constructor(private http: HttpClient) {}

  getPlans(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/plans`);
  }

  initiatePayment(payload: { planType: string; amount: number; currency: string }): Observable<string> {
    return this.http.post(`/api/pesapal/submit-order`, payload, { responseType: 'text' });
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
}
