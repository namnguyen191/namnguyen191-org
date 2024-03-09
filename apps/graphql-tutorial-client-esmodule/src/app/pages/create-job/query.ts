import { inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';

import { Job } from '../../shared/interfaces';

export type JobData = Pick<Job, 'id' | 'title' | 'description'>;
export const createJob = async (newJob: {
  title: string;
  description: string;
}): Promise<JobData> => {
  const apollo: Apollo = inject(Apollo);

  const mutationResult = await lastValueFrom(
    apollo.mutate<{ job: JobData }>({
      mutation: gql`
        mutation ($input: CreateJobInput!) {
          job: createJob(input: $input) {
            title
            description
            id
          }
        }
      `,
      variables: { input: newJob },
    })
  );

  if (mutationResult.errors?.length || !mutationResult.data) {
    throw new Error('Something went wrong fetching job by id');
  }

  return mutationResult.data.job;
};
