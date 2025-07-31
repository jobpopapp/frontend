import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pesapal-iframe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pesapal-iframe.component.html',
  styleUrls: ['./pesapal-iframe.component.scss']
})
export class PesapalIframeComponent implements OnInit, OnDestroy {
  @Input() iframeUrl: string | null = null;
  safeIframeUrl: SafeResourceUrl | null = null;
  isLoading = true;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    if (this.iframeUrl && this.iframeUrl.trim() !== '') {
      this.safeIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.iframeUrl);
    } else {
      this.isLoading = false; // No URL to load, so stop loading
    }
  }

  onLoad(): void {
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    // Clean up if necessary
  }
}
