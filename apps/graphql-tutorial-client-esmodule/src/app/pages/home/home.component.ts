import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  inject,
  OnInit,
  runInInjectionContext,
  signal,
  WritableSignal,
} from '@angular/core';
import { fetchWithStatus } from '@namnguyen191/utils';
import { Apollo } from 'apollo-angular';

import { JobListComponent } from '../../components/job-list/job-list.component';
import { PaginationBarComponent } from '../../components/pagination-bar/pagination-bar.component';
import { Job } from '../../shared/interfaces';
import { getAllJobs } from './query';

@Component({
  standalone: true,
  imports: [PaginationBarComponent, JobListComponent, CommonModule],
  selector: 'namnguyen191-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  apollo: Apollo = inject(Apollo);
  environmentInjector = inject(EnvironmentInjector);

  allJobsResource = fetchWithStatus({
    fetcher: getAllJobs,
  });

  jobs: WritableSignal<Job[]> = signal([]);

  ngOnInit(): void {
    runInInjectionContext(this.environmentInjector, () => {
      this.allJobsResource.startFetching();
    });
  }
}
