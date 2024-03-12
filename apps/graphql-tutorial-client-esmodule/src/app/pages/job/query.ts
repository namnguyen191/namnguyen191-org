import { inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';

import { Job } from '../../shared/interfaces';

export const JobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    title
    company {
      id
      name
    }
    description
    date
  }
`;

export const JobByIdQuery = gql`
  query JobById($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${JobDetailFragment}
`;

export const getJobById = async (id: string): Promise<Job> => {
  const apollo: Apollo = inject(Apollo);

  const queryResult = await lastValueFrom(
    apollo.query<{ job: Job }>({
      query: JobByIdQuery,
      variables: { id },
    })
  );

  if (queryResult.errors?.length) {
    throw new Error('Something went wrong fetching job by id');
  }

  return queryResult.data.job;
};
