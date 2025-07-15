import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  @Input() billingAddress: any = {
    email_address: 'john.doe@example.com',
    phone_number: '0723xxxxxx',
    country_code: 'UGX',
    first_name: 'John',
    middle_name: '',
    last_name: 'Doe',
    line_1: 'Pesapal Limited',
    line_2: '',
    city: '',
    state: '',
    postal_code: '',
    zip_code: ''
  };
}
