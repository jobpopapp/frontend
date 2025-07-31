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

  editCompany(company: Company): void {
    Swal.fire({
      title: 'Edit Company Profile',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Company Name" value="${company.name}">
        <input id="swal-input2" class="swal2-input" placeholder="Email" value="${company.email}">
        <input id="swal-input3" class="swal2-input" placeholder="Phone" value="${company.phone}">
        <input id="swal-input4" class="swal2-input" placeholder="Country" value="${company.country}">
      `,
      focusConfirm: false,
      preConfirm: () => {
        const name = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const email = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const phone = (document.getElementById('swal-input3') as HTMLInputElement).value;
        const country = (document.getElementById('swal-input4') as HTMLInputElement).value;
        return { name, email, phone, country };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.adminService.updateCompanyProfile(company.id, result.value).subscribe({
          next: (response) => {
            if (response.success && response.data) {
              Swal.fire('Updated!', `Company ${company.name} profile has been updated.`, 'success');
              this.loadCompanies(); // Refresh the list
            } else {
              Swal.fire('Error', response.message || 'Failed to update company profile.', 'error');
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
