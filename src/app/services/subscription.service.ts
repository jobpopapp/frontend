import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from '../core/services/api.service';

export type SubscriptionStatusString = 'active' | 'expired' | 'none';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private apiUrl = '/api/subscription';

  constructor(private http: HttpClient, private apiService: ApiService) {}

  getPlans(): Observable<any> {
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
    return this.http.post(`/api/pesapal/submit-order`, payload, { headers, responseType: 'json' });
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
