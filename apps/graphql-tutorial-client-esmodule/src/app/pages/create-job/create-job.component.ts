import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'namnguyen191-create-job',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-job.component.html',
  styleUrl: './create-job.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateJobComponent {}
