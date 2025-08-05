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
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteCompany(companyId).subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire('Deleted!', 'The company has been deleted.', 'success');
              this.loadCompanies(); // Refresh the list
            } else {
              Swal.fire('Error', response.message || 'Failed to delete company.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error', err.message || 'An error occurred.', 'error');
          }
        });
      }
    });
  }
}
