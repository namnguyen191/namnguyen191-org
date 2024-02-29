import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, ApolloModule, gql } from 'apollo-angular';

import { Company, Job } from '../../components/job-item/job-item.component';
import { JobListComponent } from '../../components/job-list/job-list.component';

@Component({
  selector: 'namnguyen191-company',
  standalone: true,
  imports: [CommonModule, JobListComponent, ApolloModule],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyComponent implements OnInit {
  company: Company = {
    name: 'FeetTV',
    description: 'Some shitty company',
  };

  jobs: WritableSignal<Job[]> = signal([]);

  apollo: Apollo = inject(Apollo);

  ngOnInit(): void {
    this.apollo
      .watchQuery<{ jobs: Job[] }>({
        query: gql`
          {
            jobs {
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
      .valueChanges.subscribe((result: ApolloQueryResult<{ jobs: Job[] }>) => {
        this.jobs.set(result.data.jobs);
      });
  }
}
