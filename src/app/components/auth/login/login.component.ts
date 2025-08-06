import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/interfaces';

declare var google: any;

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit(): void {
    // Initialize Google Sign-In after the view has been initialized
    google.accounts.id.initialize({
      client_id: '998086120823-8sc67lt7a9nfev174ia8ca1tarr2ff76.apps.googleusercontent.com', // Replace with your actual Google Client ID
      callback: (response: any) => this.handleGoogleLogin(response)
    });

    google.accounts.id.renderButton(
      document.getElementById("google-btn"),
      { size: "large", type: "standard", shape: "rectangular", text: "signin_with", width: "300" }
    );
  }

  handleGoogleLogin(response: any): void {
    this.ngZone.run(() => {
      if (response.credential) {
        this.isLoading = true;
        this.errorMessage = '';
        this.authService.googleLogin(response.credential).subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.success && res.data && res.data.company && res.data.company.email) {
              const userEmail = res.data.company.email.toLowerCase();
              if (userEmail === 'jobpopapp@gmail.com' || userEmail === 'admin@jobpop.app') {
                this.router.navigate(['/admin/dashboard']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            } else {
              this.errorMessage = res.message || 'Google login failed: Missing user data.';
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error("Frontend received error:", err);
            this.errorMessage = err.message || 'An error occurred during Google login. Please try again.';
          }
        });
      } else {
        this.errorMessage = 'Google login failed: No credential received.';
      }
    });
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            const userEmail = this.loginForm.value.email.toLowerCase();
            if (userEmail === 'jobpopapp@gmail.com' || userEmail === 'admin@jobpop.app') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          } else {
            this.errorMessage = response.message || 'Login failed. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'An error occurred. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
