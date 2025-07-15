import { Component, OnInit } from '@angular/core';
import { BillingService, BillingAddress } from '../../services/billing.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-billing-address',
  templateUrl: './billing-address.component.html',
  styleUrls: ['./billing-address.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class BillingAddressComponent implements OnInit {
  billingAddress: BillingAddress = {
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
        if (address) this.billingAddress = address;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  saveAddress() {
    this.loading = true;
    this.billingService.saveBillingAddress(this.billingAddress).subscribe({
      next: (updated) => {
        this.billingAddress = updated;
        this.success = true;
        this.loading = false;
        setTimeout(() => this.success = false, 3000);
      },
      error: (err) => {
        this.error = 'Failed to save billing address.';
        this.loading = false;
        setTimeout(() => this.error = null, 3000);
      }
    });
  }
}
