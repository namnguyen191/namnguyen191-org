import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Apollo, ApolloModule, gql } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';

import { Job } from '../../components/job-item/job-item.component';

type JobLoader = {
  isLoading: boolean;
  isError: boolean;
  job: Job | null;
};

@Component({
  selector: 'namnguyen191-job',

  standalone: true,
  imports: [CommonModule, ApolloModule, RouterModule],
  templateUrl: './job.component.html',
  styleUrl: './job.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobComponent implements OnInit {
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  apollo: Apollo = inject(Apollo);

  jobLoader: WritableSignal<JobLoader> = signal({
    isLoading: false,
    isError: false,
    job: null,
  });

  ngOnInit(): void {
    this._fetchJob();
  }

  private async _fetchJob(): Promise<void> {
    this.jobLoader.update((prev) => ({ ...prev, isLoading: true }));
    const jobId = this.activatedRoute.snapshot.paramMap.get('jobId');
    if (!jobId) {
      this.jobLoader.update((prev) => ({ ...prev, isError: true, isLoading: true }));
      return;
    }

    try {
      const queryResult = await lastValueFrom(
        this.apollo.query<{ job: Job }>({
          query: gql`
          {
            job(id: "${jobId}") {
              id
              title
              company {
                name
              }
              description
              date
            }
          }
        `,
        })
      );
      if (queryResult.errors?.length) {
        this.jobLoader.update((prev) => ({ ...prev, isError: true, isLoading: false }));
        return;
      }
      this.jobLoader.set({ job: queryResult.data.job, isError: false, isLoading: false });
    } catch (error) {
      this.jobLoader.update((prev) => ({ ...prev, isError: true, isLoading: false }));
    }
  }
}
