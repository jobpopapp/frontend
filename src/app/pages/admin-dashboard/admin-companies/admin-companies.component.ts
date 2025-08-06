import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { Company } from '../../../core/interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-companies.component.html',
  styleUrl: './admin-companies.component.scss'
})
export class AdminCompaniesComponent implements OnInit {
  companies: Company[] = [];
  loading = true;
  error: string | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;
    this.adminService.getCompanies().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.companies = response.data;
        } else {
          this.error = response.message || 'Failed to load companies.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'An error occurred while fetching companies.';
        this.loading = false;
      }
    });
  }

  verifyCompany(company: Company): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${company.is_verified ? 'unverify' : 'verify'} ${company.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.updateCompanyVerification(company.id, !company.is_verified).subscribe({
          next: (response) => {
            if (response.success && response.data) {
              Swal.fire('Updated!', `Company ${company.name} verification status has been updated.`, 'success');
              this.loadCompanies(); // Refresh the list
            } else {
              Swal.fire('Error', response.message || 'Failed to update verification status.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error', err.message || 'An error occurred.', 'error');
          }
        });
      }
    });
  }

  deleteCompany(companyId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! A 4-digit code will be sent to the director's number to confirm.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, send code!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Step 1: Initiate 2FA
        this.adminService.initiateCompanyDelete2FA(companyId).subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire({
                title: 'Code Sent!',
                text: response.message || "A 4-digit code has been sent to the director's number. Please enter it below to confirm deletion.",
                icon: 'info',
                input: 'text',
                inputPlaceholder: 'Enter 4-digit code',
                showCancelButton: true,
                confirmButtonText: 'Confirm Deletion',
                showLoaderOnConfirm: true,
                preConfirm: (code) => {
                  if (!code || code.length !== 4 || !/^[0-9]{4}$/.test(code)) {
                    Swal.showValidationMessage('Please enter a valid 4-digit code');
                  }
                  return code;
                },
                allowOutsideClick: () => !Swal.isLoading()
              }).then((codeResult) => {
                if (codeResult.isConfirmed && codeResult.value) {
                  // Step 2: Confirm deletion with 2FA code
                  this.adminService.deleteCompany(companyId, codeResult.value).subscribe({
                    next: (deleteResponse) => {
                      if (deleteResponse.success) {
                        Swal.fire('Deleted!', deleteResponse.message || 'The company has been deleted.', 'success');
                        this.loadCompanies(); // Refresh the list
                      } else {
                        Swal.fire('Error', deleteResponse.message || 'Failed to delete company.', 'error');
                      }
                    },
                    error: (deleteError) => {
                      Swal.fire('Error', deleteError.error?.message || 'An error occurred during deletion.', 'error');
                    }
                  });
                }
              });
            } else {
              Swal.fire('Error', response.message || 'Failed to initiate 2FA.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'An error occurred while initiating 2FA.', 'error');
          }
        });
      }
    });
  }
}
