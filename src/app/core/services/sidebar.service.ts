import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarOpen = new BehaviorSubject<boolean>(false);

  get sidebarOpen$() {
    return this.sidebarOpen.asObservable();
  }

  toggle() {
    this.sidebarOpen.next(!this.sidebarOpen.value);
  }
}
