import { getJobs, Job } from '../../db/jobs.js';

export const jobResolvers = {
  Query: {
    job: (): unknown => ({
      id: 'some-id',
      title: 'Package handler',
      description: 'Basically modern slavery',
    }),
    jobs: async (): Promise<Job[]> => getJobs(10, 0),
  },
};
