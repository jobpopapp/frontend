import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { HttpParams } from '@angular/common/http';

export interface BillingAddress {
  id?: string;
  company_id?: string; // Add company_id to the interface
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
  private apiUrl = '/api/billing-address';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getBillingAddress(): Observable<BillingAddress> {
    const companyId = this.authService.getCurrentCompanyId();
    if (!companyId) {
      throw new Error('Company ID not available.');
    }
    let params = new HttpParams().set('company_id', companyId);
    return this.http.get<BillingAddress>(this.apiUrl, { params });
  }

  saveBillingAddress(addressData: BillingAddress): Observable<BillingAddress> {
    const companyId = this.authService.getCurrentCompanyId();
    if (!companyId) {
      throw new Error('Company ID not available.');
    }
    // Create a clean copy of the data to send
    const dataToSend: Partial<BillingAddress> = { ...addressData, company_id: companyId };

    if (dataToSend.id) {
      // Update existing address
      return this.http.put<BillingAddress>(`${this.apiUrl}/${dataToSend.id}`, dataToSend);
    } else {
      // For new addresses, explicitly delete the id property to avoid sending `id: undefined`
      delete dataToSend.id;
      // Create new address
      return this.http.post<BillingAddress>(this.apiUrl, dataToSend);
    }
  }
}
