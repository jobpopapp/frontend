import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Company, ApiResponse } from '../interfaces';

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
}
