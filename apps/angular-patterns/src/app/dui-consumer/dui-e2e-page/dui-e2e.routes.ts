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
      {
        path: 'carousel-patterns',
        loadComponent: () =>
          import('./features/carousel-patterns/carousel-patterns.component').then(
            (m) => m.CarouselPatternsComponent
          ),
      },
      {
        path: 'carousel-card-patterns',
        loadComponent: () =>
          import('./features/carousel-card-patterns/carousel-card-patterns.component').then(
            (m) => m.CarouselCardPatternsComponent
          ),
      },
      {
        path: 'simple-text-patterns',
        loadComponent: () =>
          import('./features/simple-text-patterns/simple-text-patterns.component').then(
            (m) => m.SimpleTextPatternsComponent
          ),
      },
      {
        path: 'builder-patterns',
        loadChildren: () =>
          import('./features/builder-patterns/lib.routes').then((m) => m.builderRoutes),
      },
      { path: '**', redirectTo: 'builder-patterns', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
