import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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
  limit = 5;
  currentPage = signal<number>(1);
  totalCount = signal<number>(0);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.limit));

  allJobsResource = fetchWithStatus({
    fetcher: (limit: number, offset: number) => getAllJobs(limit, offset),
  });

  jobs: WritableSignal<Job[]> = signal([]);

  constructor() {
    effect(
      () => {
        const totalJobsCount = this.allJobsResource.fetchState().data?.totalCount;
        if (totalJobsCount) {
          this.totalCount.set(totalJobsCount);
        }
      },
      {
        allowSignalWrites: true,
      }
    );
  }

  onPageSelect(newPage: number): void {
    if (newPage === this.currentPage()) {
      return;
    }
    this.currentPage.set(newPage);
    runInInjectionContext(this.environmentInjector, () => {
      this.allJobsResource.startFetching(this.limit, this.currentPage());
    });
  }

  ngOnInit(): void {
    runInInjectionContext(this.environmentInjector, () => {
      this.allJobsResource.startFetching(this.limit, this.currentPage());
    });
  }
}
