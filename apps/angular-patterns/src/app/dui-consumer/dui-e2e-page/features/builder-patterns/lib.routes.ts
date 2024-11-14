import { Route } from '@angular/router';

export const builderRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/ui-elements-list-page/ui-elements-list-page.component').then(
        (m) => m.UiElementsListPageComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/new-ui-element-page/new-ui-element-page.component').then(
        (m) => m.NewUIElementPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
