import { Route } from '@angular/router';

export const builderRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./uiElementsListPage/uiElementsListPage.component').then(
        (m) => m.UiElementsListPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
