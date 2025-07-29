// Authentication interfaces
export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  is_verified: boolean;
  certificate_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  country: string;
  password: string;
}

export interface AuthResponse {
  company?: Company;
  token?: string;
}

// Job interfaces
export interface Job {
  id: string;
  company_id?: string;
  company?: string;
  title: string;
  description: string;
  job_description?: string;
  requirements: string;
  location: string;
  country?: string;
  city?: string;
  salary_range: string;
  salary?: string;
  deadline?: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  category?: { id: string; name: string; };
  category_id?: string;
  is_foreign: boolean;
  email?: string;
  phone?: string;
  whatsapp?: string;
  application_link?: string;
  status?: 'active' | 'expired' | 'draft';
  featured?: boolean;
  applications_count?: number;
  views_count?: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface JobCreateRequest {
  company_id?: string;
  company?: string;
  title: string;
  description: string;
  job_description?: string;
  requirements: string;
  location: string;
  country?: string;
  salary_range: string;
  salary?: string;
  deadline?: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  category: string;
  is_foreign: boolean;
  status?: 'active' | 'draft' | 'expired';
  email?: string;
  phone?: string;
  whatsapp?: string;
  application_link?: string;
}

export interface JobCategory {
  id: string;
  name: string;
  description?: string;
}

// Subscription interfaces
export interface Subscription {
  id: string;
  company_id: string;
  plan_type: 'monthly' | 'annual' | 'per_job';
  start_date: string;
  end_date: string;
  is_active: boolean;
  auto_renew: boolean;
  pesapal_txn_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days?: number;
  features: string[];
  popular?: boolean;
}

export interface PaymentRequest {
  planType: 'monthly' | 'annual' | 'per_job';
  amount: number;
  currency: string;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard interfaces
export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  expiredJobs: number;
  totalApplications: number;
  subscriptionStatus: 'active' | 'expired' | 'none';
  subscriptionDaysLeft?: number;
}

// Upload interfaces
export interface FileUploadResponse {
  success: boolean;
  message: string;
  url?: string;
  error?: string;
}

// Form validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}
