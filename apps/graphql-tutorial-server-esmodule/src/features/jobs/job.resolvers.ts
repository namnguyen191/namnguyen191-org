import { Company, getCompany } from '../../db/companies.js';
import { getJob, getJobs, Job } from '../../db/jobs.js';

const toISODate = (date: string): string => date.slice(0, 'yyyy-mm-dd'.length);

export const jobResolvers = {
  Query: {
    job: (_root: unknown, args: { id: string }): Promise<Job | undefined> => getJob(args.id),
    jobs: async (): Promise<Job[]> => getJobs(10, 0),
  },

  Job: {
    date: (job: Job): string => toISODate(job.createdAt),
    company: (job: Job): Promise<Company | undefined> => getCompany(job.companyId),
  },
};
