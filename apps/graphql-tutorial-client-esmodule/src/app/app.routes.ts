import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((mod) => mod.HomeComponent),
  },
  {
    path: 'companies/:companyId',
    loadComponent: () =>
      import('./pages/company/company.component').then((mod) => mod.CompanyComponent),
  },
  {
    path: 'jobs/new',
    loadComponent: () =>
      import('./pages/create-job/create-job.component').then((mod) => mod.CreateJobComponent),
  },
  {
    path: 'jobs/:jobId',
    loadComponent: () => import('./pages/job/job.component').then((mod) => mod.JobComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((mod) => mod.LoginComponent),
  },
];
