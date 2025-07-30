import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container text-center mt-5">
      <div class="card p-4 shadow-sm">
        <h2 class="text-danger mb-3">Payment Failed!</h2>
        <p class="lead">Unfortunately, your payment could not be processed.</p>
        <p>Please try again or contact support.</p>
        <a routerLink="/subscription" class="btn btn-primary mt-3">Try Again</a>
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
export class PaymentFailureComponent { }
