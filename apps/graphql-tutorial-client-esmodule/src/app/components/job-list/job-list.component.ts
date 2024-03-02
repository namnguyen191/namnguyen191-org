import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

import { Job } from '../../shared/interfaces';
import { JobItemComponent } from '../job-item/job-item.component';

@Component({
  selector: 'namnguyen191-job-list',
  standalone: true,
  imports: [CommonModule, JobItemComponent],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobListComponent {
  jobs: InputSignal<Job[]> = input.required();
}
