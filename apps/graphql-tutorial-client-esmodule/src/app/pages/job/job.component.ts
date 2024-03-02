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
import { Apollo } from 'apollo-angular';

import { Job, JobService } from '../../api/job.service';

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
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  apollo: Apollo = inject(Apollo);
  jobService: JobService = inject(JobService);

  jobLoader: WritableSignal<JobLoader> = signal({
    isLoading: false,
    isError: false,
    job: null,
  });

  ngOnInit(): void {
    this.#fetchJob();
  }

  async #fetchJob(): Promise<void> {
    this.jobLoader.update((prev) => ({ ...prev, isLoading: true }));
    const jobId = this.activatedRoute.snapshot.paramMap.get('jobId');
    if (!jobId) {
      this.jobLoader.update((prev) => ({ ...prev, isError: true, isLoading: true }));
      return;
    }

    try {
      const job = await this.jobService.getJobById(jobId);
      this.jobLoader.set({ job, isError: false, isLoading: false });
    } catch (error) {
      this.jobLoader.update((prev) => ({ ...prev, isError: true, isLoading: false }));
    }
  }
}
