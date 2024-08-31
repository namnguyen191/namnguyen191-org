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
import { fetchWithStatus } from '@namnguyen191/common-angular-helper';
import { Apollo } from 'apollo-angular';

import { JobListComponent } from '../../components/job-list/job-list.component';
import { Job } from '../../shared/interfaces';
import { CompanyWithJobs, getCompanyById } from './query';

@Component({
  selector: 'namnguyen191-company',
  standalone: true,
  imports: [CommonModule, JobListComponent],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyComponent implements OnInit {
  readonly #apollo = inject(Apollo);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #environmentInjector = inject(EnvironmentInjector);

  companyWithJobsResource = fetchWithStatus({
    fetcher: this.#fetchCompany.bind(this),
  });

  jobs: WritableSignal<Job[]> = signal([]);

  ngOnInit(): void {
    runInInjectionContext(this.#environmentInjector, () => {
      this.companyWithJobsResource.startFetching();
    });
  }

  async #fetchCompany(): Promise<CompanyWithJobs> {
    const companyId = this.#activatedRoute.snapshot.paramMap.get('companyId');
    if (!companyId) {
      throw new Error('Missing company id in url param');
    }

    return getCompanyById(companyId);
  }
}
