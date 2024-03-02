import { inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';

import { Company, Job } from '../../shared/interfaces';

export type CompanyWithJobs = Company & { jobs: Job[] };
export const getCompanyById = async (id: string): Promise<CompanyWithJobs> => {
  const apollo: Apollo = inject(Apollo);

  const queryResult = await lastValueFrom(
    apollo.query<{ company: CompanyWithJobs }>({
      query: gql`
        query CompanyById($id: ID!) {
          company(id: $id) {
            id
            name
            description
            jobs {
              title
              date
              id
            }
          }
        }
      `,
      variables: { id },
    })
  );

  if (queryResult.errors?.length) {
    throw new Error('Something went wrong fetching job by id');
  }

  return queryResult.data.company;
};
