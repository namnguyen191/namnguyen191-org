import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'dui-e2e',
    loadChildren: () =>
      import('./dui-consumer/dui-e2e-page/dui-e2e.routes').then((m) => m.duiE2ERoutes),
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
  { path: '**', redirectTo: 'dui-e2e' },
];
