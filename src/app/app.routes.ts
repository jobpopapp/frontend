import { Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JobListComponent } from './pages/jobs/job-list/job-list.component';
import { JobFormComponent } from './pages/jobs/job-form/job-form.component';
import { BillingAddressComponent } from './pages/billing-address/billing-address.component';
// Payment complete page (to be created)
import { PaymentResultComponent } from './pages/subscription/payment-result/payment-result.component';
import { SubscriptionPlansComponent } from './pages/subscription/subscription-plans.component';

export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected routes (will add auth guard later)
  { path: 'dashboard', component: DashboardComponent },
  { path: 'jobs', component: JobListComponent },
  { path: 'jobs/new', component: JobFormComponent },
  { path: 'jobs/edit/:id', component: JobFormComponent },
  { path: 'subscription', component: SubscriptionPlansComponent },
  { path: 'billing-address', component: BillingAddressComponent },
  { path: 'subscription/payment-result', component: PaymentResultComponent },
  
  // Wildcard route - should be last
  { path: '**', redirectTo: '/home' }
];
