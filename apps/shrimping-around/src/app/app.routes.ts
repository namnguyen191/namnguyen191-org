import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@namnguyen191/shrimping-around/features/home').then((m) => m.HomeComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('../components/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent
      ),
    pathMatch: 'full',
  },
];
