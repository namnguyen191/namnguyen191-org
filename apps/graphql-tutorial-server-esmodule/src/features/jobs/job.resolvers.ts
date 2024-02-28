import { getJobs, Job } from '../../db/jobs.js';

const toISODate = (date: string): string => date.slice(0, 'yyyy-mm-dd'.length);

export const jobResolvers = {
  Query: {
    job: (): unknown => ({
      id: 'some-id',
      title: 'Package handler',
      description: 'Basically modern slavery',
    }),
    jobs: async (): Promise<Job[]> => getJobs(10, 0),
  },

  Job: {
    date: (job: Job): string => toISODate(job.createdAt),
  },
};
