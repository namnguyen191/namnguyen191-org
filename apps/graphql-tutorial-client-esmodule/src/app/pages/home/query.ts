import { inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';

import { Job } from '../../shared/interfaces';

export const getAllJobs = async (): Promise<Job[]> => {
  const apollo: Apollo = inject(Apollo);

  const queryResult = await lastValueFrom(
    apollo.query<{ jobs: Job[] }>({
      query: gql`
        query AllJobs {
          jobs {
            title
            date
            id
          }
        }
      `,
      fetchPolicy: 'no-cache',
    })
  );

  if (queryResult.errors?.length) {
    throw new Error('Something went wrong fetching job by id');
  }

  return queryResult.data.jobs;
};
