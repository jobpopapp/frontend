import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface WebSocketMessage {
  type: string;
  companyId: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket$: WebSocketSubject<any> | undefined;
  public readonly messages$: Observable<any> | undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.socket$ = webSocket('ws://localhost:3001');
      this.messages$ = this.socket$.asObservable();
    }
  }

  getSubscriptionUpdates(): Observable<WebSocketMessage> | undefined {
    return this.messages$?.pipe(
      filter(msg => msg.type === 'SUBSCRIPTION_UPDATE'),
      map(msg => msg as WebSocketMessage)
    );
  }

  closeConnection() {
    this.socket$?.complete();
  }
}
