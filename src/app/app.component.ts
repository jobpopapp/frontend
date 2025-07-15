import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { WebsocketService } from './services/websocket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'jobpop-company-frontend';
  private destroy$ = new Subject<void>();

  constructor(private websocketService: WebsocketService, private router: Router) {}

  ngOnInit() {
    const updates$ = this.websocketService.getSubscriptionUpdates();
    if (updates$) {
      updates$
        .pipe(takeUntil(this.destroy$))
        .subscribe(message => {
          if (message.status === 'ACTIVE') {
            // Show notification (can use a toast service)
            alert('Subscription activated! You can now post jobs.');
            // Redirect if on payment-complete page
            if (this.router.url.startsWith('/payment-complete')) {
              this.router.navigate(['/dashboard']);
            }
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
