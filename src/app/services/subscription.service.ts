import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private apiUrl = '/api/subscription';

  constructor(private http: HttpClient) {}

  initiatePayment(planType: 'monthly' | 'annual' | 'per_job'): Observable<{ redirect_url: string }> {
    return this.http.post<{ redirect_url: string }>(`/api/subscription/initiate`, { planType });
  }
}
