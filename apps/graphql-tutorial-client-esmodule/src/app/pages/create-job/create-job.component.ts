import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { createJob } from './query';

@Component({
  selector: 'namnguyen191-create-job',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-job.component.html',
  styleUrl: './create-job.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateJobComponent {
  environmentInjector = inject(EnvironmentInjector);
  router = inject(Router);
  creatJobFormModel = {
    title: '',
    description: '',
  };
  isCreatingJob = signal<boolean>(false);

  handleSubmit(): void {
    runInInjectionContext(this.environmentInjector, async () => {
      this.isCreatingJob.set(true);
      const job = await createJob(this.creatJobFormModel);
      this.isCreatingJob.set(false);

      this.router.navigateByUrl(`/jobs/${job.id}`);
    });
  }
}
