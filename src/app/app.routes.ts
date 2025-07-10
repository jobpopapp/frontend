import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JobListComponent } from './pages/jobs/job-list/job-list.component';
import { JobFormComponent } from './pages/jobs/job-form/job-form.component';
import { SubscriptionPlansComponent } from './pages/subscription/subscription-plans/subscription-plans.component';

export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected routes (will add auth guard later)
  { path: 'dashboard', component: DashboardComponent },
  { path: 'jobs', component: JobListComponent },
  { path: 'jobs/new', component: JobFormComponent },
  { path: 'jobs/edit/:id', component: JobFormComponent },
  { path: 'subscription', component: SubscriptionPlansComponent },
  
  // Wildcard route - should be last
  { path: '**', redirectTo: '/login' }
];
