import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Subscription } from '../../../core/interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-subscriptions.component.html',
  styleUrl: './admin-subscriptions.component.scss'
})
export class AdminSubscriptionsComponent implements OnInit {
  subscriptions: (Subscription & { companies?: { name: string } })[] = []; // Extend type to include company name
  loading = true;
  error: string | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.loading = true;
    this.adminService.getSubscriptions().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.subscriptions = response.data;
        } else {
          this.error = response.message || 'Failed to load subscriptions.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'An error occurred while fetching subscriptions.';
        this.loading = false;
      }
    });
  }

  editSubscription(subscription: Subscription): void {
    Swal.fire({
      title: 'Edit Subscription',
      html: `
        <label for="swal-is-active">Is Active:</label>
        <input type="checkbox" id="swal-is-active" class="swal2-checkbox" ${subscription.is_active ? 'checked' : ''}>
        <br>
        <label for="swal-start-date">Start Date:</label>
        <input type="date" id="swal-start-date" class="swal2-input" value="${subscription.start_date ? subscription.start_date.substring(0, 10) : ''}">
        <br>
        <label for="swal-end-date">End Date:</label>
        <input type="date" id="swal-end-date" class="swal2-input" value="${subscription.end_date ? subscription.end_date.substring(0, 10) : ''}">
      `,
      focusConfirm: false,
      preConfirm: () => {
        const isActive = (document.getElementById('swal-is-active') as HTMLInputElement).checked;
        const startDate = (document.getElementById('swal-start-date') as HTMLInputElement).value;
        const endDate = (document.getElementById('swal-end-date') as HTMLInputElement).value;
        return { is_active: isActive, start_date: startDate, end_date: endDate };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.adminService.updateSubscription(subscription.id, result.value).subscribe({
          next: (response) => {
            if (response.success && response.data) {
              Swal.fire('Updated!', 'Subscription updated successfully.', 'success');
              this.loadSubscriptions();
            } else {
              Swal.fire('Error', response.message || 'Failed to update subscription.', 'error');
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
