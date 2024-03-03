import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'dui',
    loadComponent: () =>
      import('./dui-consumer/dui-consumer.component').then((m) => m.DuiConsumerComponent),
  },
  {
    path: 'injector-function',
    loadComponent: () =>
      import('./injector-function/injector-function.component').then(
        (m) => m.InjectorFunctionComponent
      ),
  },
  { path: '**', redirectTo: 'dui' },
];
