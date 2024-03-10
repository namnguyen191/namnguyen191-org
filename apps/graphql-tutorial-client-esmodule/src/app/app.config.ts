import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ApolloClientOptions, ApolloLink, InMemoryCache } from '@apollo/client';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

import { appRoutes } from './app.routes';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink, authService: AuthService): ApolloClientOptions<unknown> => {
        const http = httpLink.create({ uri: '/graphql-tutorial-server-esmodule/graphql' });
        const middleware = new ApolloLink((operation, forward) => {
          operation.setContext({
            headers: new HttpHeaders().set('Authorization', `Bearer ${authService.getToken()}`),
          });
          return forward(operation);
        });

        const link = middleware.concat(http);
        return {
          cache: new InMemoryCache(),
          link,
        };
      },
      deps: [HttpLink, AuthService],
    },
    Apollo,
  ],
};
