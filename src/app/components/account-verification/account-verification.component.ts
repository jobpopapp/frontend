import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-verification.component.html',
  styleUrl: './account-verification.component.scss'
})
export class AccountVerificationComponent {
  @Output() verificationComplete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  selectedFile: File | null = null;
  isUploading = false;
  uploadSuccess = false;
  uploadProgress = 0;
  isDragOver = false;
  errorMessage = '';

  selectedLicenseFile: File | null = null;
  isUploadingLicense = false;
  uploadLicenseSuccess = false;
  uploadLicenseProgress = 0;
  isDragOverLicense = false;
  licenseErrorMessage = '';

  constructor(private apiService: ApiService, private authService: AuthService) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file: File) {
    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    if (file.size > maxSize) {
      this.errorMessage = 'File size must be less than 5MB';
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Please upload a PDF, JPG, or PNG file';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
  }

  removeFile() {
    this.selectedFile = null;
    this.errorMessage = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  uploadFile() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    this.apiService.uploadFile('/companies/certificate', this.selectedFile, undefined, 'certificate').subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        setTimeout(() => {
          this.isUploading = false;
          this.uploadSuccess = true;
          const company = this.authService.getCurrentCompany();
          if (company) {
            this.authService.sendDocumentUploadNotification(company.name, this.selectedFile?.name || 'unknown document');
          }
        }, 500);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.errorMessage = error.message || 'Upload failed. Please try again.';
      }
    });
  }

  // License upload methods
  onDragOverLicense(event: DragEvent) {
    event.preventDefault();
    this.isDragOverLicense = true;
  }

  onDragLeaveLicense(event: DragEvent) {
    event.preventDefault();
    this.isDragOverLicense = false;
  }

  onDropLicense(event: DragEvent) {
    event.preventDefault();
    this.isDragOverLicense = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleLicenseFile(files[0]);
    }
  }

  onLicenseFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleLicenseFile(file);
    }
  }

  handleLicenseFile(file: File) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    if (file.size > maxSize) {
      this.licenseErrorMessage = 'File size must be less than 5MB';
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      this.licenseErrorMessage = 'Please upload a PDF, JPG, or PNG file';
      return;
    }

    this.selectedLicenseFile = file;
    this.licenseErrorMessage = '';
  }

  removeLicenseFile() {
    this.selectedLicenseFile = null;
    this.licenseErrorMessage = '';
  }

  uploadLicenseFile() {
    if (!this.selectedLicenseFile) return;

    this.isUploadingLicense = true;
    this.uploadLicenseProgress = 0;

    const progressInterval = setInterval(() => {
      this.uploadLicenseProgress += 10;
      if (this.uploadLicenseProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    this.apiService.uploadFile('/companies/license', this.selectedLicenseFile, undefined, 'license').subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadLicenseProgress = 100;
        setTimeout(() => {
          this.isUploadingLicense = false;
          this.uploadLicenseSuccess = true;
          const company = this.authService.getCurrentCompany();
          if (company) {
            this.authService.sendDocumentUploadNotification(company.name, this.selectedLicenseFile?.name || 'unknown license');
          }
        }, 500);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isUploadingLicense = false;
        this.licenseErrorMessage = error.message || 'Upload failed. Please try again.';
      }
    });
  }

  onCancel() {
    this.cancel.emit();
  }

  goBackToDashboard() {
    this.verificationComplete.emit();
  }
}