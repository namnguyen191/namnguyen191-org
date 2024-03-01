import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Apollo, ApolloModule, gql } from 'apollo-angular';
import { map, Observable, switchMap } from 'rxjs';

import { Job } from '../../components/job-item/job-item.component';

@Component({
  selector: 'namnguyen191-job',
  standalone: true,
  imports: [CommonModule, ApolloModule, RouterModule],
  templateUrl: './job.component.html',
  styleUrl: './job.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobComponent {
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  apollo: Apollo = inject(Apollo);

  job$: Observable<Job>;

  constructor() {
    this.job$ = this.activatedRoute.params.pipe(
      switchMap((params) => {
        const jobId: string = params['jobId'];
        return this.apollo.watchQuery<{ job: Job }>({
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
        }).valueChanges;
      }),
      map((queryResult) => queryResult.data.job)
    );
  }
}
