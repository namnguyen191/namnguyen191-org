import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'namnguyen191-job',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job.component.html',
  styleUrl: './job.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobComponent {}
