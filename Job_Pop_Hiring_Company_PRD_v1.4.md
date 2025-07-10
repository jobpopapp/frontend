# Job Pop App - Hiring Company Module PRD (v1.4)

**Platform:** Angular 19 Web Dashboard  
**Backend:** Express.js (Node.js)  
**Auth & Storage:** Supabase (Auth, Storage, DB)  
**Payments:** Pesapal API  
**Language:** English Only  
**Hosting:** Namecheap Shared Hosting (Frontend + Backend)  
**Version:** v1.4  
**Date Generated:** 2025-07-08

---

## 🔹 1. TECH STACK

| Layer        | Technology                  | Purpose |
|--------------|-----------------------------|---------|
| Frontend     | Angular 19                  | Company-facing dashboard UI |
| Backend      | Express.js (Node.js)        | REST API for job CRUD, auth, payments |
| Database     | Supabase PostgreSQL         | Stores company, job, subscription data |
| Authentication | Supabase Auth             | Email/password login with JWT |
| File Storage | Supabase Storage            | Upload & store Certificate of Incorporation |
| Payments     | Pesapal API v3              | Handles subscription billing |
| Hosting      | Namecheap Shared Hosting    | Hosts Angular frontend and Express backend together |

---

## 🔹 2. KEY USER FLOW

1. Company registers (free)
2. Uploads **Certificate of Incorporation**
3. Status: **"Waiting for approval"**
4. Admin reviews and approves
5. Company subscribes via **Pesapal**
6. Company can **post/manage jobs**
7. Jobs appear in job seeker mobile app

---

## 🔹 3. FEATURES SUMMARY

### A. Registration & Verification

- Required Fields: name, email, phone, password, country
- Upload certificate (PDF/JPG/PNG) < 2MB
- File saved in Supabase Storage
- Status: `is_verified = false`
- UI: “Waiting for Approval” message + Contact Admin options

### B. Subscription Plans

| Plan       | Cost     | Duration |
|------------|----------|----------|
| Monthly    | $50      | 30 days  |
| Annual     | $500     | 365 days |
| Per Job    | $30      | 1 job    |

- Uses Pesapal Auth & SubmitOrderRequest endpoints

### C. Job Management

| Field | Required | Notes |
|-------|----------|-------|
| Title | ✅ | Max 100 chars |
| Description | ✅ | Markdown/HTML |
| Category | ✅ | Dropdown |
| Country | ✅ | Uganda or Abroad |
| Salary | ❌ | Optional |
| Deadline | ✅ | Must be future |
| Foreign Employer | ❌ | Checkbox |
| Email, Phone, WhatsApp | ❌ | Optional |
| Application Link | ❌ | If set, shows "Apply" button |

---

## 🔹 4. DATABASE MODELS

### `companies`
```sql
id | name | email | phone | country | password_hash | is_verified | certificate_url | created_at
```

### `jobs`
```sql
id | title | description | category | salary | deadline | country | company_id | is_foreign | email | phone | whatsapp | application_link | created_at
```

### `subscriptions`
```sql
id | company_id | plan_type | start_date | end_date | is_active | auto_renew | pesapal_txn_id
```

---

## 🔹 5. EXPRESS.JS API ROUTES

| Method | Route | Description |
|--------|-------|-------------|
| POST   | /api/auth/register         | Register company |
| POST   | /api/auth/login            | Login + JWT |
| POST   | /api/companies/certificate | Upload certificate |
| GET    | /api/companies/me          | Get company info |
| GET    | /api/jobs/my               | Get company's jobs |
| POST   | /api/jobs                  | Post new job |
| PUT    | /api/jobs/:id              | Edit job |
| DELETE | /api/jobs/:id              | Delete job |
| POST   | /api/subscription/initiate | Start Pesapal payment |
| POST   | /api/subscription/callback | Pesapal webhook |

---

## 🔹 6. ANGULAR FRONTEND PAGES

- Register/Login
- Upload Certificate
- Dashboard (status message)
- My Jobs (edit/delete)
- Post New Job
- Subscription Plans
- Profile Update
- Admin Contact Link

---

## 🔹 7. NON-FUNCTIONAL REQUIREMENTS

| Requirement | Detail |
|-------------|--------|
| Upload Limit | 2MB |
| File Formats | PDF, PNG, JPG |
| Responsive | Mobile, tablet, desktop |
| Session | JWT |
| HTTPS | All routes and file uploads |

---

## 🔹 8. SECURITY

- Supabase RLS for all tables
- Express JWT middleware
- Supabase private storage bucket for files
- HTTPS required

---

## 🔹 9. EXCLUDED FEATURES

| Feature | Reason |
|---------|--------|
| In-App Chat | Out of scope |
| Job Application Tracker | Handled externally |
| Team Accounts | Single login per company |

---
