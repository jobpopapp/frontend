import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent {
  scrollY = 0;
  showDownloadModal = false;

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.scrollY = window.scrollY;
  }

  openDownloadModal() {
    this.showDownloadModal = true;
  }

  closeDownloadModal() {
    this.showDownloadModal = false;
  }

  downloadFromPlayStore() {
    // Add your Google Play Store URL here
    window.open('https://play.google.com/store', '_blank');
  }

  downloadFromAppStore() {
    // Add your Apple App Store URL here
    window.open('https://apps.apple.com/', '_blank');
  }
}
