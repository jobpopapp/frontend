import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { Company, LoginRequest, RegisterRequest, AuthResponse, FileUploadResponse, ApiResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentCompanySubject = new BehaviorSubject<Company | null>(null);
  public currentCompany$ = this.currentCompanySubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    // Check if user is already logged in
    this.loadCurrentCompany();
  }

  // Load current company from localStorage
  private loadCurrentCompany(): void {
    const token = this.apiService.getToken();
    if (token && this.apiService.isAuthenticated()) {
      // Get company profile from API
      this.getProfile().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentCompanySubject.next(response.data);
          }
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  // Login company
  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => {
        if (response.success && response.data?.token && response.data?.company) {
          this.apiService.setToken(response.data.token);
          this.currentCompanySubject.next(response.data.company);
        }
      })
    );
  }

  // Register company
  register(companyData: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.apiService.post<AuthResponse>('/auth/register', companyData).pipe(
      tap(response => {
        if (response.success && response.data?.token && response.data?.company) {
          this.apiService.setToken(response.data.token);
          this.currentCompanySubject.next(response.data.company);
        }
      })
    );
  }

  // Logout company
  logout(): void {
    this.apiService.removeToken();
    this.currentCompanySubject.next(null);
    this.router.navigate(['/login']);
  }

  // Get current company profile
  getProfile(): Observable<{ success: boolean; data?: Company; message: string }> {
    return this.apiService.get<Company>('/companies/profile');
  }

  // Update company profile
  updateProfile(profileData: Partial<Company>): Observable<{ success: boolean; data?: Company; message: string }> {
    return this.apiService.put<Company>('/companies/profile', profileData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentCompanySubject.next(response.data);
        }
      })
    );
  }

  // Upload certificate
  uploadCertificate(file: File): Observable<FileUploadResponse> {
    return this.apiService.uploadFile('/companies/certificate', file);
  }

  // Check if company is authenticated
  isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }

  // Check if company is verified
  isVerified(): boolean {
    const company = this.currentCompanySubject.value;
    return company?.is_verified || false;
  }

  // Get current company
  getCurrentCompany(): Company | null {
    return this.currentCompanySubject.value;
  }

  // Get current company ID
  getCurrentCompanyId(): string | null {
    return this.currentCompanySubject.value?.id || null;
  }

  // Refresh token
  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    return this.apiService.post<AuthResponse>('/auth/refresh', {}).pipe(
      tap(response => {
        if (response.success && response.data?.token) {
          this.apiService.setToken(response.data.token);
        }
      })
    );
  }

  // Change password
  changePassword(oldPassword: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.apiService.post('/auth/change-password', {
      oldPassword,
      newPassword
    });
  }

  // Forgot password
  forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return this.apiService.post('/auth/forgot-password', { email });
  }

  // Reset password
  resetPassword(token: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.apiService.post('/auth/reset-password', {
      token,
      newPassword
    });
  }
}
