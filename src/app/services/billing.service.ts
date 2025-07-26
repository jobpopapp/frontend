import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BillingAddress {
  email_address: string;
  phone_number?: string;
  country_code?: string;
  first_name?: string;
  last_name?: string;
  line_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  zip_code?: string;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private apiUrl = '/api/billing';

  constructor(private http: HttpClient) {}

  getBillingAddress(): Observable<BillingAddress> {
    return this.http.get<BillingAddress>(this.apiUrl);
  }

  saveBillingAddress(addressData: BillingAddress): Observable<BillingAddress> {
    return this.http.post<BillingAddress>(this.apiUrl, addressData);
  }
}
