import { inject, Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';

export type Company = {
  id: string;
  name: string;
  description?: string;
};

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  #apollo: Apollo = inject(Apollo);

  async getCompanyById(id: string): Promise<Company> {
    const queryResult = await lastValueFrom(
      this.#apollo.query<{ company: Company }>({
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
  }
}
