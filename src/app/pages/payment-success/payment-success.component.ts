import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container text-center mt-5">
      <div class="card p-4 shadow-sm">
        <h2 class="text-success mb-3">Payment Successful!</h2>
        <p class="lead">Your payment has been processed successfully.</p>
        <p>Thank you for your subscription.</p>
        <a routerLink="/dashboard" class="btn btn-primary mt-3">Go to Dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .card {
      max-width: 500px;
      margin: 0 auto;
    }
  `]
})
export class PaymentSuccessComponent { }
