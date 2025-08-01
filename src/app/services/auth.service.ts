import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LoginRequest, ApiResponse } from '../core/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  constructor(private router: Router) { }

  login(credentials: LoginRequest): Observable<ApiResponse> {
    // This is a placeholder for actual authentication logic.
    // In a real application, you would call a backend API here.
    if (credentials.email === 'admin@jobpop.app' && credentials.password === 'admin') { // Example credentials
      this.loggedIn.next(true);
      this.router.navigate(['/admin/dashboard']);
      return of({ success: true, message: 'Login successful' });
    } else {
      this.loggedIn.next(false);
      alert('Invalid credentials');
      return of({ success: false, message: 'Invalid credentials' });
    }
  }

  logout(): void {
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  // This method would be used to check if a user is authenticated
  // based on a token or session in a real application.
  isAuthenticated(): boolean {
    // For now, we'll just return the value of loggedIn.
    // In a real app, you'd check for a valid token in localStorage/sessionStorage
    return this.loggedIn.getValue();
  }
}

