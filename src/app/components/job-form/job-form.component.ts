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
        if (data && data.categories && Array.isArray(data.categories)) {
          this.jobCategories = data.categories.map((name: string, idx: number) => ({ id: idx + 1, name }));
        } else if (Array.isArray(data)) {
          this.jobCategories = data;
        } else {
          this.jobCategories = [];
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
      job_type: ['', Validators.required],
      salary: [''],
      deadline: ['', [Validators.required, this.futureDateValidator]],
      is_foreign: [false],
      email: [''],
      phone: [''],
      application_link: [''],
      // Legacy fields for compatibility with existing interface
      description: [''],
      location: [''],
      salary_range: [''],
      // Additional optional fields that are in the form
      job_duration: [''],
      experience_level: [''],
      visibility: ['public'],
      whatsapp: ['']
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
    this.jobService.getJob(this.jobId).subscribe({
      next: (response: any) => {
        const job = response.data || response;
        this.populateForm(job);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load job data:', error);
        this.isLoading = false;
      }
    });
  }

  private populateForm(job: Partial<Job>): void {
    this.jobForm.patchValue({
      title: job.title || '',
      company: (job as any).company || '',
      job_description: job.description || (job as any).job_description || '',
      requirements: job.requirements || '',
      category: job.category || '',
      country: (job as any).country || job.location || '',
      salary: (job as any).salary || job.salary_range || '',
      deadline: (job as any).deadline || '',
      is_foreign: job.is_foreign || false,
      email: job.email || '',
      phone: job.phone || '',
      application_link: job.application_link || '',
      // Legacy fields for compatibility
      description: job.description || '',
      location: job.location || '',
      salary_range: job.salary_range || '',
      job_type: job.job_type || 'full-time',
      // Additional fields
      job_duration: '',
      experience_level: '',
      visibility: 'public',
      whatsapp: job.whatsapp || ''
    });

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
          console.log('Job updated successfully');
        } else {
          console.log('Job created successfully');
        }
      },
      error: (error: any) => {
        console.error('Failed to save job:', error);
        console.error('Error details:', error.error);
        this.isLoading = false;
        
        // Show user-friendly error message
        alert('Failed to save job. Please check all required fields and try again.');
      }
    });
  }

  saveDraft(): void {
    if (!this.jobForm.get('title')?.value) {
      alert('Please enter a job title before saving as draft');
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
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to save draft:', error);
        this.isLoading = false;
      }
    });
  }

  private prepareFormData(): JobCreateRequest {
    const formValue = this.jobForm.value;
    // Prepare data according to database schema
    const data: any = {
      title: formValue.title,
      company: formValue.company,
      job_description: formValue.job_description,
      category_id: formValue.category_id,
      country: formValue.country,
      salary: formValue.salary || null,
      deadline: formValue.deadline,
      is_foreign: formValue.is_foreign || false,
      // Additional fields for legacy compatibility
      description: formValue.job_description,
      requirements: formValue.requirements,
      location: formValue.country,
      salary_range: formValue.salary,
      job_type: formValue.job_type || 'full-time'
    };

    // Add all contact methods if filled
    if (formValue.email) {
      data.email = formValue.email;
    }
    if (formValue.phone) {
      data.phone = formValue.phone;
    }
    if (formValue.application_link) {
      data.application_link = formValue.application_link;
    }

    return data as JobCreateRequest;
  }

  cancel(): void {
    if (this.jobForm.dirty) {
      const confirmed = confirm('Are you sure you want to cancel? Any unsaved changes will be lost.');
      if (!confirmed) return;
    }
    
    this.jobCancelled.emit();
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

  getFormCompletionPercentage(): number {
    const requiredFields = ['title', 'company', 'job_description', 'requirements', 'category', 'country', 'job_type', 'deadline'];
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
