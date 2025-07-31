import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { NavbarComponent } from '../../../components/layout/navbar/navbar.component';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.scss']
})
export class PaymentResultComponent implements OnInit {
  orderTrackingId: string | null = null;
  paymentStatus: string | null = null;
  isSuccess: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderTrackingId = params['orderTrackingId'] || null;
      this.paymentStatus = params['status'] || null;
      this.isSuccess = this.paymentStatus === 'Completed';
    });
  }

  closeIframe(): void {
    // This function will be called when the user closes the iframe/modal
    // You can navigate back to the subscription plans or dashboard
    this.router.navigate(['/subscription']);
  }
}
