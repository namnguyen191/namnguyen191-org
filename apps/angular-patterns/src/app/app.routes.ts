import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'dui',
    loadComponent: () =>
      import('./dui-consumer/dui-consumer.component').then((m) => m.DuiConsumerComponent),
  },
  {
    path: 'dui-e2e',
    loadComponent: () =>
      import('./dui-consumer/dui-e2e-page/dui-e2e-page.component').then(
        (m) => m.DuiE2EPageComponent
      ),
  },
  {
    path: 'injector-function',
    loadComponent: () =>
      import('./injector-function/injector-function.component').then(
        (m) => m.InjectorFunctionComponent
      ),
  },
  {
    path: 'lazy-loaded-service',
    loadComponent: () =>
      import('./lazy-loaded-service/lazy-loaded-service.component').then(
        (m) => m.LazyLoadedServiceComponent
      ),
  },
  { path: '**', redirectTo: 'dui' },
];
