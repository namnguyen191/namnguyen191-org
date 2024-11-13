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
    path: 'new',
    loadComponent: () =>
      import('./newUIElementPage/newUIElementPage.component').then(
        (m) => m.NewUIElementPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
