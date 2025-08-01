import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent {
  scrollY = 0;

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.scrollY = window.scrollY;
  }

  openDownloadModal() {
    Swal.fire({
      title: 'Download JobPop Job Seeker App',
      html: `
        <p>Looking for your next job? Download the JobPop mobile app to browse thousands of job opportunities and apply instantly:</p>
        <div class="download-options" style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
          <a href="https://play.google.com/store" target="_blank" class="download-btn" style="display: flex; align-items: center; justify-content: center; padding: 15px 20px; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; font-weight: bold; transition: background-color 0.3s ease;">
            <img src="/google.png" alt="Google Play" class="store-icon" style="width: 30px; height: 30px; margin-right: 15px;">
            <div class="download-text" style="display: flex; flex-direction: column; align-items: flex-start;">
              <span class="download-label" style="font-size: 0.8em; color: #666;">Get it on</span>
              <span class="store-name" style="font-size: 1.1em;">Google Play</span>
            </div>
          </a>
          <a href="https://apps.apple.com/" target="_blank" class="download-btn" style="display: flex; align-items: center; justify-content: center; padding: 15px 20px; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; font-weight: bold; transition: background-color 0.3s ease;">
            <i class="bi bi-apple" style="font-size: 30px; color: #000; margin-right: 15px;"></i>
            <div class="download-text" style="display: flex; flex-direction: column; align-items: flex-start;">
              <span class="download-label" style="font-size: 0.8em; color: #666;">Download on the</span>
              <span class="store-name" style="font-size: 1.1em;">App Store</span>
            </div>
          </a>
          <a href="/jobpopapp.apk" download class="download-btn" style="display: flex; align-items: center; justify-content: center; padding: 15px 20px; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333; font-weight: bold; transition: background-color 0.3s ease;">
            <i class="bi bi-android" style="font-size: 30px; color: #3DDC84; margin-right: 15px;"></i>
            <div class="download-text" style="display: flex; flex-direction: column; align-items: flex-start;">
              <span class="download-label" style="font-size: 0.8em; color: #666;">Download</span>
              <span class="store-name" style="font-size: 1.1em;">Direct APK</span>
            </div>
          </a>
        </div>
      `,
      icon: 'info',
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup: 'swal2-download-modal',
        title: 'swal2-download-modal-title',
        htmlContainer: 'swal2-download-modal-html-container'
      }
    });
  }
}

