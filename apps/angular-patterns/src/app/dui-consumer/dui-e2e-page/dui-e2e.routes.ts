import { Route } from '@angular/router';

import { DuiE2EPageComponent } from './dui-e2e-page.component';

export const duiE2ERoutes: Route[] = [
  {
    path: '',
    component: DuiE2EPageComponent,
    children: [
      {
        path: 'button-patterns',
        loadComponent: () =>
          import('./features/button-patterns/button-patterns.component').then(
            (m) => m.ButtonPatternsComponent
          ),
      },
      {
        path: 'table-patterns',
        loadComponent: () =>
          import('./features/table-patterns/table-patterns.component').then(
            (m) => m.TablePatternsComponent
          ),
      },
      {
        path: 'text-card-patterns',
        loadComponent: () =>
          import('./features/text-card-patterns/text-card-patterns.component').then(
            (m) => m.TextCardPatternsComponent
          ),
      },
      { path: '**', redirectTo: 'button-patterns', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
