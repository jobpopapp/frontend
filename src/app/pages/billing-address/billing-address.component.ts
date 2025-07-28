import { Component, OnInit } from '@angular/core';
import { BillingService, BillingAddress } from '../../services/billing.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/layout/navbar/navbar.component';

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
    console.log('[BillingAddressComponent] Saving billing address:', this.billingAddress);
    this.billingService.saveBillingAddress(this.billingAddress).subscribe({
      next: (updated) => {
        this.billingAddress = updated;
        this.success = true;
        this.loading = false;
        setTimeout(() => this.success = false, 3000);
      },
      error: (err) => {
        console.error('[BillingAddressComponent] Save error:', err);
        this.error = err?.error?.message || 'Failed to save billing address.';
        this.loading = false;
        setTimeout(() => this.error = null, 3000);
      }
    });
  }
}
