import { inject, Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';

export type Company = {
  id: string;
  name: string;
  description?: string;
};

export type Job = {
  id: string;
  company?: Company;
  title: string;
  description: string;
  date: string;
};

@Injectable({
  providedIn: 'root',
})
export class JobService {
  #apollo: Apollo = inject(Apollo);

  async getJobById(id: string): Promise<Job> {
    const queryResult = await lastValueFrom(
      this.#apollo.query<{ job: Job }>({
        query: gql`
          query JobById($id: ID!) {
            job(id: $id) {
              id
              title
              company {
                name
              }
              description
              date
            }
          }
        `,
        variables: { id },
      })
    );

    if (queryResult.errors?.length) {
      throw new Error('Something went wrong fetching job by id');
    }

    return queryResult.data.job;
  }
}
