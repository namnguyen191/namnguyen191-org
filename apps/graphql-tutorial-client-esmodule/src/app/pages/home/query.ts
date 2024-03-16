import { inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';

import { Job } from '../../shared/interfaces';

export type GetAllJobsResult = {
  totalCount: number;
  items: Job[];
};
export const getAllJobs = async (limit: number, offset: number): Promise<GetAllJobsResult> => {
  const apollo: Apollo = inject(Apollo);

  const queryResult = await lastValueFrom(
    apollo.query<{ jobs: GetAllJobsResult }>({
      query: gql`
        query AllJobs($limit: Int!, $offset: Int!) {
          jobs(limit: $limit, offset: $offset) {
            totalCount
            items {
              title
              date
              id
            }
          }
        }
      `,
      fetchPolicy: 'no-cache',
      variables: {
        limit,
        offset,
      },
    })
  );

  if (queryResult.errors?.length) {
    throw new Error('Something went wrong fetching job by id');
  }

  return queryResult.data.jobs;
};
