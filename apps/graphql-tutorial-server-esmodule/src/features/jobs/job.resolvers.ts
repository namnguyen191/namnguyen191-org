import { Company, getCompany } from '../../db/companies.js';
import { getJob, getJobs, Job } from '../../db/jobs.js';
import { notFoundError } from '../../utils/graphql-helpers.js';

const toISODate = (date: string): string => date.slice(0, 'yyyy-mm-dd'.length);

export const jobResolvers = {
  Query: {
    job: async (_root: unknown, args: { id: string }): Promise<Job> => {
      const { id } = args;
      const job = await getJob(id);
      if (!job) {
        return notFoundError(`Cannot find job with id ${id}`);
      }

      return job;
    },
    jobs: async (): Promise<Job[]> => getJobs(10, 0),
  },

  Job: {
    date: (job: Job): string => toISODate(job.createdAt),
    company: (job: Job): Promise<Company | undefined> => getCompany(job.companyId),
  },
};
