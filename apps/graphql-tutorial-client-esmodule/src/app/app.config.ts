import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink): ApolloClientOptions<unknown> => {
        return {
          cache: new InMemoryCache(),
          link: httpLink.create({
            uri: '/graphql-tutorial-server-esmodule/graphql',
          }),
        };
      },
      deps: [HttpLink],
    },
    Apollo,
  ],
};
