import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Company, Job } from '../../components/job-item/job-item.component';
import { JobListComponent } from '../../components/job-list/job-list.component';

@Component({
  selector: 'namnguyen191-company',
  standalone: true,
  imports: [CommonModule, JobListComponent],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyComponent {
  company: Company = {
    name: 'FeetTV',
    description: 'Some shitty company',
  };

  jobs: Job[] = [
    {
      id: '1',
      company: {
        name: 'FeetTV',
      },
      title: 'SDE',
      description: 'Be a wizard',
      date: '2023-04-16',
    },
    {
      id: '2',
      company: {
        name: 'FeetTV',
      },
      title: 'Devops',
      description: 'Be a warlock',
      date: '2023-01-22',
    },
  ];
}
