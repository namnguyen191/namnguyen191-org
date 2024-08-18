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
import { ActivatedRoute, RouterModule } from '@angular/router';

import { Job } from '../../shared/interfaces';
import { getJobById } from './query';

type JobLoader = {
  isLoading: boolean;
  isError: boolean;
  job: Job | null;
};

@Component({
  selector: 'namnguyen191-job',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job.component.html',
  styleUrl: './job.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobComponent implements OnInit {
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #environmentInjector = inject(EnvironmentInjector);

  jobLoader: WritableSignal<JobLoader> = signal({
    isLoading: false,
    isError: false,
    job: null,
  });

  ngOnInit(): void {
    this.#fetchJob();
  }

  async #fetchJob(): Promise<void> {
    runInInjectionContext(this.#environmentInjector, async () => {
      this.jobLoader.update((prev) => ({ ...prev, isLoading: true }));
      const jobId = this.#activatedRoute.snapshot.paramMap.get('jobId');
      if (!jobId) {
        this.jobLoader.update((prev) => ({ ...prev, isError: true, isLoading: true }));
        return;
      }

      try {
        const job = await getJobById(jobId);
        this.jobLoader.set({ job, isError: false, isLoading: false });
      } catch (error) {
        this.jobLoader.update((prev) => ({ ...prev, isError: true, isLoading: false }));
      }
    });
  }
}
