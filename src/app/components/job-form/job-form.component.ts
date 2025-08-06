interface Category {
  id: number;
  name: string;
  description?: string;
}
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { Job, JobCreateRequest } from '../../core/interfaces';
import { JobCategory } from '../../core/interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './job-form.component.html',
  styleUrl: './job-form.component.scss'
})
export class JobFormComponent implements OnInit {
  // ...existing code...
  @Input() jobId?: string; // For editing existing jobs
  @Input() initialData?: Partial<Job>; // Pre-populate form data
  @Output() jobSaved = new EventEmitter<Job>();
  @Output() jobCancelled = new EventEmitter<void>();

  jobForm!: FormGroup;
  isLoading = false;
  isEdit = false;
  applicationMethod: 'email' | 'phone' | 'link' = 'email';

  jobCategories: JobCategory[] = [];

  countries = [
    { value: 'kenya', label: 'Kenya' },
    { value: 'uganda', label: 'Uganda' },
    { value: 'tanzania', label: 'Tanzania' },
    { value: 'rwanda', label: 'Rwanda' },
    { value: 'burundi', label: 'Burundi' },
    { value: 'south-sudan', label: 'South Sudan' },
    { value: 'ethiopia', label: 'Ethiopia' },
    { value: 'somalia', label: 'Somalia' },
    { value: 'djibouti', label: 'Djibouti' },
    { value: 'eritrea', label: 'Eritrea' },
    { value: 'sudan', label: 'Sudan' },
    { value: 'egypt', label: 'Egypt' },
    { value: 'libya', label: 'Libya' },
    { value: 'tunisia', label: 'Tunisia' },
    { value: 'algeria', label: 'Algeria' },
    { value: 'morocco', label: 'Morocco' },
    { value: 'nigeria', label: 'Nigeria' },
    { value: 'ghana', label: 'Ghana' },
    { value: 'south-africa', label: 'South Africa' },
    { value: 'other', label: 'Other' }
  ];


  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private router: Router
  ) {
    this.initializeForm();
  }

  // Fetch categories from backend
  fetchCategories(): void {
    this.jobService.getCategories().subscribe({
      next: (response) => {
        // If response.data.categories is an array of strings, map to objects
        const data: any = response.data;
        if (data && Array.isArray(data)) {
          this.jobCategories = data;
          console.log('jobCategories:', this.jobCategories);
        } else {
          this.jobCategories = [];
          console.log('jobCategories (empty):', this.jobCategories);
        }
      },
      error: (error) => {
        console.error('Failed to fetch categories:', error);
      }
    });
  }

  // Custom validator for future dates
  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (selectedDate <= today) {
      return { futureDate: { message: 'Deadline must be in the future' } };
    }
    
    return null;
  }

  ngOnInit(): void {
    this.isEdit = !!this.jobId;
    this.fetchCategories();
    if (this.jobId) {
      this.loadJobData();
    } else if (this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  private initializeForm(): void {
    this.jobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      company: ['', [Validators.required, Validators.minLength(2)]],
      job_description: ['', [Validators.required, Validators.minLength(50)]],
      requirements: ['', [Validators.required, Validators.minLength(20)]],
      category_id: [null, Validators.required],
          country: ['', Validators.required],
          city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      job_type: ['', Validators.required],
      salary: [''],
      deadline: ['', [Validators.required, this.futureDateValidator]],
      is_foreign: [false],
      email: ['', Validators.email],
      phone: ['', Validators.pattern(/^\+?[1-9]\d{1,14}$/)],
      application_link: ['', Validators.pattern('https?://.+')],
      // Legacy fields for compatibility with existing interface
      description: [''],
      location: [''],
      salary_range: [''],
      // Additional optional fields that are in the form
      job_duration: [''],
      experience_level: [''],
      visibility: ['public'],
      whatsapp: ['']
    }, { validators: this.atLeastOneApplicationDetailValidator });
        // Watch for application method changes
        this.setupApplicationMethodValidators();
        // Set is_foreign based on country selection
        this.jobForm.get('country')?.valueChanges.subscribe((country) => {
          this.jobForm.get('is_foreign')?.setValue(country !== 'uganda');
        });

    // Watch for application method changes
    this.setupApplicationMethodValidators();
  }

  private setupApplicationMethodValidators(): void {
    // Remove existing validators
    this.jobForm.get('email')?.clearValidators();
    this.jobForm.get('phone')?.clearValidators();
    this.jobForm.get('application_link')?.clearValidators();

    // Validate each contact method independently (optional, but must be valid if filled)
    this.jobForm.get('email')?.setValidators([Validators.email]);
    this.jobForm.get('phone')?.setValidators([Validators.pattern(/^\+?[1-9]\d{1,14}$/)]);
    this.jobForm.get('application_link')?.setValidators([Validators.pattern('https?://.+')]);

    // Update validity
    this.jobForm.get('email')?.updateValueAndValidity();
    this.jobForm.get('phone')?.updateValueAndValidity();
    this.jobForm.get('application_link')?.updateValueAndValidity();
  }

  onApplicationMethodChange(method: 'email' | 'phone' | 'link'): void {
    // No longer needed, but keep for compatibility
    this.setupApplicationMethodValidators();
  }

  private loadJobData(): void {
    if (!this.jobId) return;

    this.isLoading = true;
    console.log(`[JobFormComponent] Fetching job data for ID: ${this.jobId}`);
    this.jobService.getJob(this.jobId).subscribe({
      next: (response: any) => {
        console.log('[JobFormComponent] Job data fetched successfully:', response);
        const job = response.job || response.data; // Extract the nested job object
        this.populateForm(job);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('[JobFormComponent] Failed to load job data:', error);
        this.isLoading = false;
      }
    });
  }

  private populateForm(response: any): void {
    console.log('[JobFormComponent] Populating form with job data:', response);

    const job = response.job; // Extract the nested job object

    if (!job) {
      console.error('[JobFormComponent] Job object not found in response.', response);
      return;
    }

    const patchData = {
      title: job.title || '',
      company: job.company || '',
      job_description: job.job_description || job.description || '',
      requirements: job.requirements || '',
      category_id: job.category_id ? String(job.category_id) : (job.category ? job.category.id : null), // Ensure category_id is a string
      country: job.country || job.location || '',
      city: job.city || '',
      salary: job.salary || job.salary_range || '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().substring(0, 10) : '',
      is_foreign: job.is_foreign || false,
      email: job.email || '',
      phone: job.phone || '',
      application_link: job.application_link || '',
      job_type: job.job_type || 'full-time',
      whatsapp: job.whatsapp || ''
    };

    console.log('[JobFormComponent] Patching form with data:', patchData);
    this.jobForm.patchValue(patchData);

    // Determine application method
    if (job.email) {
      this.applicationMethod = 'email';
    } else if (job.phone) {
      this.applicationMethod = 'phone';
    } else if (job.application_link) {
      this.applicationMethod = 'link';
    }

    this.setupApplicationMethodValidators();
  }

  onSubmit(): void {
    if (this.jobForm.invalid) {
      this.markFormGroupTouched();
      console.log('Form is invalid. Errors:', this.getFormErrors());
      return;
    }

    this.isLoading = true;
    const formData = this.prepareFormData();
    
    // Log the data being sent for debugging
    console.log('Submitting job data:', formData);

    const request = this.isEdit 
      ? this.jobService.updateJob(this.jobId!, formData)
      : this.jobService.createJob(formData);

    request.subscribe({
      next: (response: any) => {
        const job = response.data || response;
        this.jobSaved.emit(job);
        this.isLoading = false;
        
        // Show success message or redirect
        if (this.isEdit) {
          Swal.fire({
          icon: 'success',
          title: 'Job Updated!',
          text: 'Job updated successfully!',
          confirmButtonColor: '#3085d6'
        });
        this.router.navigate(['/dashboard']);
        } else {
          Swal.fire({
          icon: 'success',
          title: 'Job Created!',
          text: 'Job created successfully!',
          confirmButtonColor: '#3085d6'
        });
        this.router.navigate(['/dashboard']);
        }
      },
      error: (error: any) => {
        console.error('Failed to save job:', error);
        console.error('Error details:', error.error);
        this.isLoading = false;
        
        // Show user-friendly error message
      Swal.fire({
  icon: 'error',
  title: 'Error!',
  html: `
    <p style="color: #d33;">Please address the following issues:</p>
    <ul style="color: #555; text-align: left;">
      <li><span style="color: #c0392b;">1. Ensure you have an active subscription.</span></li>
      <li><span style="color: #c0392b;">2. Fill in all required fields before saving the job.</span></li>
    </ul>
  `,
  confirmButtonColor: '#3085d6'
});
      }
    });
  }

  saveDraft(): void {
    if (!this.jobForm.get('title')?.value) {
      Swal.fire({
      icon: 'warning',
      title: 'Missing Title',
      text: 'Please enter a job title before saving as draft',
      confirmButtonColor: '#3085d6'
    });
      return;
    }

    this.isLoading = true;
    const formData = this.prepareFormData();
    formData.status = 'draft';

    const request = this.isEdit 
      ? this.jobService.updateJob(this.jobId!, formData)
      : this.jobService.createJob(formData);

    request.subscribe({
      next: (response: any) => {
        console.log('Draft saved successfully');
        Swal.fire({
          icon: 'success',
          title: 'Draft Saved!',
          text: 'Job saved as draft!',
          confirmButtonColor: '#3085d6'
        });
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to save draft:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to save draft. Please try again.',
          confirmButtonColor: '#3085d6'
        });
        this.isLoading = false;
      }
    });
  }

  private prepareFormData(): JobCreateRequest {
    const formValue = this.jobForm.value;
    // Build payload to match backend spec
    const data: any = {
      title: formValue.title,
      company: formValue.company,
      country: formValue.country,
      city: formValue.city || '',
      salary: formValue.salary || '',
      deadline: formValue.deadline,
      job_description: formValue.job_description, // backend expects 'job_description'
      requirements: formValue.requirements,
      application_link: formValue.application_link || '',
      email: formValue.email || '',
      phone: formValue.phone || '',
      company_website: formValue.company_website || 'NULL',
      whatsapp: formValue.whatsapp || '',
      category_id: Number(formValue.category_id),
      job_type: formValue.job_type || 'full-time',
      is_foreign: formValue.is_foreign || false
    };
    return data;
  }

  cancel(): void {
    if (this.jobForm.dirty) {
      const confirmed = confirm('Are you sure you want to close? Any unsaved changes will be lost.');
      if (!confirmed) return;
    }
    
    this.router.navigate(['/dashboard']);
  }

  previewJob(): void {
    if (this.jobForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    // Implement preview functionality
    console.log('Preview job:', this.jobForm.value);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.jobForm.controls).forEach(key => {
      const control = this.jobForm.get(key);
      control?.markAsTouched();
    });
  }

  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.jobForm.controls).forEach(key => {
      const control = this.jobForm.get(key);
      if (control && control.invalid && control.touched) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  getDescriptionPreview(): string {
    const description = this.jobForm.get('job_description')?.value || '';
    return description.length > 100 ? description.substring(0, 100) + '...' : description || 'Job description will appear here...';
  }

  getCategoryLabel(id: number): string {
    const category = this.jobCategories.find(cat => String(cat.id) === String(id));
    return category ? category.name : String(id);
  }

  getCountryLabel(value: string): string {
    const country = this.countries.find(c => c.value === value);
    return country ? country.label : value;
  }

  getJobTypeLabel(value: string): string {
    const jobTypeLabels: { [key: string]: string } = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship'
    };
    return jobTypeLabels[value] || value;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  atLeastOneApplicationDetailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.get('email')?.value;
    const phone = control.get('phone')?.value;
    const applicationLink = control.get('application_link')?.value;

    if (!email && !phone && !applicationLink) {
      return { atLeastOneRequired: true };
    }
    return null;
  }

  getFormCompletionPercentage(): number {
    const requiredFields = ['title', 'company', 'job_description', 'requirements', 'category_id', 'country', 'job_type', 'deadline'];
    // All contact methods are optional, but count as completed if filled and valid
    const contactFields = ['email', 'phone', 'application_link'];
    const completedFields = requiredFields.filter(field => {
      const value = this.jobForm.get(field)?.value;
      return value && value.toString().trim().length > 0;
    });
    const validContacts = contactFields.filter(field => {
      const value = this.jobForm.get(field)?.value;
      const control = this.jobForm.get(field);
      return value && value.toString().trim().length > 0 && control && control.valid;
    });
    const totalFields = requiredFields.length + contactFields.length;
    return Math.round(((completedFields.length + validContacts.length) / totalFields) * 100);
  }
}
