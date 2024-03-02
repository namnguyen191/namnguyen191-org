import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { Job } from '../../api/job.service';

@Component({
  selector: 'namnguyen191-job-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-item.component.html',
  styleUrl: './job-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobItemComponent {
  job: InputSignal<Job> = input.required();
  title: Signal<string> = computed(() => {
    const job = this.job();
    return job.company ? `${job.title} at ${job.company.name}` : this.job().title;
  });
}
