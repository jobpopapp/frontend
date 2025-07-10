import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Company } from '../../../core/interfaces';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();
  
  currentCompany: Company | null = null;
  pageTitle = 'Dashboard';
  notificationCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentCompany$.subscribe(company => {
      this.currentCompany = company;
    });

    // Update page title based on current route
    this.updatePageTitle();
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  getCompanyInitials(): string {
    if (!this.currentCompany?.name) return 'C';
    
    const words = this.currentCompany.name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return this.currentCompany.name.substring(0, 2).toUpperCase();
  }

  viewProfile(): void {
    // Navigate to company profile page (to be implemented)
    this.router.navigate(['/profile']);
  }

  viewSettings(): void {
    // Navigate to settings page (to be implemented)
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.authService.logout();
  }

  private updatePageTitle(): void {
    const url = this.router.url;
    
    if (url.includes('/dashboard')) {
      this.pageTitle = 'Dashboard';
    } else if (url.includes('/jobs')) {
      this.pageTitle = 'Job Management';
    } else if (url.includes('/subscription')) {
      this.pageTitle = 'Subscription';
    } else {
      this.pageTitle = 'JobPop Company Portal';
    }
  }
}
