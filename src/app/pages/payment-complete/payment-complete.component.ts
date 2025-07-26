import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionService } from '../../core/services/subscription.service';

@Component({
  selector: 'app-payment-complete',
  templateUrl: './payment-complete.component.html',
  styleUrls: ['./payment-complete.component.scss']
})
export class PaymentCompleteComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subscriptionService: SubscriptionService
  ) { }

  ngOnInit(): void {
    const trackingId = this.route.snapshot.queryParamMap.get('tracking_id');
    if (trackingId) {
      this.subscriptionService.verifyPayment(trackingId).subscribe({
        next: (response) => {
          if (response && response.data && response.data.status === 'COMPLETED') {
            this.router.navigate(['/dashboard'], { queryParams: { payment: 'success' } });
          } else {
            this.router.navigate(['/dashboard'], { queryParams: { payment: 'failed' } });
          }
        },
        error: (err) => {
          this.router.navigate(['/dashboard'], { queryParams: { payment: 'failed' } });
        }
      });
    }
  }
}
