import { inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';

import { Company } from '../../shared/interfaces';

export const getCompanyById = async (id: string): Promise<Company> => {
  const apollo: Apollo = inject(Apollo);

  const queryResult = await lastValueFrom(
    apollo.query<{ company: Company }>({
      query: gql`
        query CompanyById($id: ID!) {
          company(id: $id) {
            id
            name
            description
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
