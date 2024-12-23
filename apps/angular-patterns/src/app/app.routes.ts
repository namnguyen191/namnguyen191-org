import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'injector-function',
    loadComponent: () =>
      import('./injector-function/injector-function.component').then(
        (m) => m.InjectorFunctionComponent
      ),
  },
  {
    path: 'sigal-store',
    loadComponent: () => import('./signal-store/books.component').then((m) => m.BooksComponent),
  },
  {
    path: 'lazy-loaded-service',
    loadComponent: () =>
      import('./lazy-loaded-service/lazy-loaded-service.component').then(
        (m) => m.LazyLoadedServiceComponent
      ),
  },
  { path: '**', redirectTo: 'sigal-store' },
];
