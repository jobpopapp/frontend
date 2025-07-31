// (removed duplicate getDefaultBillingAddress)
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { BillingService, BillingAddress } from '../../services/billing.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/layout/navbar/navbar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-billing-address',
  templateUrl: './billing-address.component.html',
  styleUrls: ['./billing-address.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, NavbarComponent]
})
export class BillingAddressComponent implements OnInit {
  billingAddress: BillingAddress = this.getDefaultBillingAddress();

  loading = false;
  success = false;
  error: string | null = null;

  private getDefaultBillingAddress(): BillingAddress {
    return {
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
  }

  constructor(private billingService: BillingService, private cdr: ChangeDetectorRef, private ngZone: NgZone) {
    console.log('[BillingAddressComponent] Constructor - loading:', this.loading);
  }

  ngOnInit() {
    console.log('[BillingAddressComponent] ngOnInit - Before setting loading to true:', this.loading);
    this.loading = true;
    console.log('[BillingAddressComponent] ngOnInit - After setting loading to true:', this.loading);
    this.billingService.getBillingAddress().subscribe({
      next: (address) => {
        if (address) {
          this.billingAddress = address;
        } else {
          this.billingAddress = this.getDefaultBillingAddress();
        }
        console.log('[BillingAddressComponent] ngOnInit - getBillingAddress next - Before setting loading to false:', this.loading);
        this.ngZone.run(() => {
          this.loading = false;
          console.log('[BillingAddressComponent] ngOnInit - getBillingAddress next - After setting loading to false (inside ngZone):', this.loading);
        });
      },
      error: () => {
        this.billingAddress = this.getDefaultBillingAddress();
        console.log('[BillingAddressComponent] ngOnInit - getBillingAddress error - Before setting loading to false:', this.loading);
        this.ngZone.run(() => {
          this.loading = false;
          console.log('[BillingAddressComponent] ngOnInit - getBillingAddress error - After setting loading to false (inside ngZone):', this.loading);
        });
      }
    });
  }

  saveAddress() {
    // Always ensure billingAddress is never null after save
    console.log('[BillingAddressComponent] saveAddress - Before setting loading to true:', this.loading);
    this.loading = true;
    console.log('[BillingAddressComponent] saveAddress - After setting loading to true:', this.loading);

    const addressToSend = { ...this.billingAddress };

    // Validate country_code format
    if (addressToSend.country_code && addressToSend.country_code.length !== 2) {
      this.ngZone.run(() => {
        this.loading = false;
        this.success = false;
        this.error = 'Country Code must be a 2-letter ISO code (e.g., US, UG).';
      });
      return;
    }

    console.log('[BillingAddressComponent] Saving billing address:', addressToSend);
    this.billingService.saveBillingAddress(addressToSend).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.loading = false;
          this.success = true;
          this.error = null;
          // Do not reset the form on success, allow user to see saved data
          // this.billingAddress = this.getDefaultBillingAddress();
          Swal.fire({
            icon: 'success',
            title: 'Address Saved!',
            text: 'Your billing address has been successfully saved.',
            showConfirmButton: false,
            timer: 1500
          });
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.success = false;
          this.error = err?.error?.message || 'Failed to save billing address.';
          if (!this.billingAddress) this.billingAddress = this.getDefaultBillingAddress();
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: this.error ?? '',
          });
        });
      }
    });
  }
}
