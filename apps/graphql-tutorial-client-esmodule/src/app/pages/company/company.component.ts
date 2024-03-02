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
import { ActivatedRoute } from '@angular/router';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, gql } from 'apollo-angular';

import { JobListComponent } from '../../components/job-list/job-list.component';
import { Company, Job } from '../../shared/interfaces';
import { getCompanyById } from './query';

type CompanyLoader = {
  isLoading: boolean;
  isError: boolean;
  company: Company | null;
};

@Component({
  selector: 'namnguyen191-company',
  standalone: true,
  imports: [CommonModule, JobListComponent],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyComponent implements OnInit {
  apollo: Apollo = inject(Apollo);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  environmentInjector = inject(EnvironmentInjector);

  companyLoader: WritableSignal<CompanyLoader> = signal({
    isLoading: false,
    isError: false,
    company: null,
  });

  jobs: WritableSignal<Job[]> = signal([]);

  ngOnInit(): void {
    this.#fetchCompany();

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

  #fetchCompany(): void {
    runInInjectionContext(this.environmentInjector, async () => {
      this.companyLoader.update((prev) => ({ ...prev, isLoading: true }));
      const companyId = this.activatedRoute.snapshot.paramMap.get('companyId');
      if (!companyId) {
        this.companyLoader.update((prev) => ({ ...prev, isError: true, isLoading: true }));
        return;
      }

      try {
        const company = await getCompanyById(companyId);
        this.companyLoader.set({ company, isError: false, isLoading: false });
      } catch (error) {
        this.companyLoader.update((prev) => ({ ...prev, isError: true, isLoading: false }));
      }
    });
  }
}
