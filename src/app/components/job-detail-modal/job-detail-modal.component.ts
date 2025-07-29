import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../core/interfaces';

@Component({
  selector: 'app-job-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="visible">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">{{ job?.title }}</h3>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <p class="text-muted mb-1"><i class="bi bi-building me-2"></i><strong>Company:</strong> {{ job?.company }}</p>
                <p class="text-muted mb-1"><i class="bi bi-geo-alt me-2"></i><strong>Location:</strong> {{ job?.country }}</p>
                <p class="text-muted mb-1"><i class="bi bi-briefcase me-2"></i><strong>Job Type:</strong> {{ job?.job_type | titlecase }}</p>
                <p class="text-muted mb-1"><i class="bi bi-tag me-2"></i><strong>Category:</strong> {{ job?.category?.name || job?.category }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted mb-1"><i class="bi bi-currency-dollar me-2"></i><strong>Salary:</strong> {{ job?.salary || job?.salary_range || 'Negotiable' }}</p>
                <p class="text-muted mb-1"><i class="bi bi-calendar me-2"></i><strong>Deadline:</strong> {{ job?.deadline | date }}</p>
                <p class="text-muted mb-1"><i class="bi bi-envelope me-2"></i><strong>Email:</strong> {{ job?.email || 'N/A' }}</p>
                <p class="text-muted mb-1"><i class="bi bi-phone me-2"></i><strong>Phone:</strong> {{ job?.phone || 'N/A' }}</p>
              </div>
            </div>
            <hr>
            <h5 class="mb-2">Job Description</h5>
            <p>{{ job?.job_description || job?.description }}</p>
            <h5 class="mt-4 mb-2">Requirements</h5>
            <p>{{ job?.requirements }}</p>
            <h5 class="mt-4 mb-2">Application Link</h5>
            <p><a [href]="job?.application_link" target="_blank">{{ job?.application_link }}</a></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="close()">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./job-detail-modal.component.scss']
})
export class JobDetailModalComponent {
  @Input() job: Job | null = null;
  @Input() visible: boolean = false;
  @Output() closeEvent = new EventEmitter<void>();

  close(): void {
    this.visible = false;
    this.closeEvent.emit();
  }
}
