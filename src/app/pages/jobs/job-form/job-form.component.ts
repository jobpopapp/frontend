import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobFormComponent as JobForm } from '../../../components/job-form/job-form.component';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { NavbarComponent } from '../../../components/layout/navbar/navbar.component';

@Component({
  selector: 'app-job-form-page',
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.scss'],
  standalone: true,
  imports: [JobForm, SidebarComponent, NavbarComponent]
})
export class JobFormComponent implements OnInit {
  jobId: string | undefined = undefined;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id') || undefined;
  }
}
