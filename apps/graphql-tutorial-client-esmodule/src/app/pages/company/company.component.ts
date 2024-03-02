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
import { Apollo } from 'apollo-angular';

import { JobListComponent } from '../../components/job-list/job-list.component';
import { Job } from '../../shared/interfaces';
import { CompanyWithJobs, getCompanyById } from './query';

type CompanyWithJobsLoader = {
  isLoading: boolean;
  isError: boolean;
  companyWithJobs: CompanyWithJobs | null;
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

  companyWithJobsLoader: WritableSignal<CompanyWithJobsLoader> = signal({
    isLoading: false,
    isError: false,
    companyWithJobs: null,
  });

  jobs: WritableSignal<Job[]> = signal([]);

  ngOnInit(): void {
    this.#fetchCompany();
  }

  #fetchCompany(): void {
    runInInjectionContext(this.environmentInjector, async () => {
      this.companyWithJobsLoader.update((prev) => ({ ...prev, isLoading: true }));
      const companyId = this.activatedRoute.snapshot.paramMap.get('companyId');
      if (!companyId) {
        this.companyWithJobsLoader.update((prev) => ({ ...prev, isError: true, isLoading: true }));
        return;
      }

      try {
        const companyWithJobs = await getCompanyById(companyId);
        this.companyWithJobsLoader.set({ companyWithJobs, isError: false, isLoading: false });
      } catch (error) {
        this.companyWithJobsLoader.update((prev) => ({ ...prev, isError: true, isLoading: false }));
      }
    });
  }
}
