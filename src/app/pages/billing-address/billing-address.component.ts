import { Component, OnInit } from '@angular/core';
import { BillingService, BillingAddress } from '../../services/billing.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/layout/navbar/navbar.component';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-billing-address',
  templateUrl: './billing-address.component.html',
  styleUrls: ['./billing-address.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, SidebarComponent, NavbarComponent]
})
export class BillingAddressComponent implements OnInit {
  billingAddress: BillingAddress = {
    id: undefined,
    email_address: '',
    phone_number: '',
    country_code: '',
    first_name: '',
    last_name: '',
    line_1: '',
    city: '',
    state: '',
    postal_code: '',
    zip_code: ''
  };
  loading = false;
  success = false;
  error: string | null = null;

  constructor(private billingService: BillingService) {}

  ngOnInit() {
    this.loading = true;
    this.billingService.getBillingAddress().subscribe({
      next: (address) => {
        if (address) {
          this.billingAddress = address;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  saveAddress() {
    this.loading = true;

    // Convert country name to 2-letter ISO code if necessary
    const addressToSend = { ...this.billingAddress };
    if (addressToSend.country_code && addressToSend.country_code.toLowerCase() === 'uganda') {
      addressToSend.country_code = 'UG';
    }

    console.log('[BillingAddressComponent] Saving billing address:', addressToSend);
    this.billingService.saveBillingAddress(addressToSend).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (updated) => {
        this.billingAddress = updated;
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Billing address saved successfully.',
          timer: 3000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('[BillingAddressComponent] Save error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err?.error?.message || 'Failed to save billing address. Please try again.'
        });
      }
    });
  }
}
