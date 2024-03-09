import { delay } from '@namnguyen191/utils';

import {
  JobResolvers,
  MutationResolvers,
  QueryResolvers,
} from '../../../__generated__/resolvers-types.js';
import { getCompany } from '../../db/companies.js';
import { createJob, deleteJob, getJob, getJobs, updateJob } from '../../db/jobs.js';
import { notFoundError } from '../../utils/graphql-helpers.js';

const toISODate = (date: string): string => date.slice(0, 'yyyy-mm-dd'.length);

type JobFeatureResolvers = {
  Query: Required<Pick<QueryResolvers, 'job' | 'jobs'>>;
  Mutation: Required<Pick<MutationResolvers, 'createJob' | 'deleteJob' | 'updateJob'>>;
  Job: Required<Pick<JobResolvers, 'date' | 'company'>>;
};

export const jobResolvers: JobFeatureResolvers = {
  Query: {
    job: async (_root, args) => {
      const { id } = args;
      const job = await getJob(id);
      if (!job) {
        return notFoundError(`Cannot find job with id ${id}`);
      }
      return job;
    },
    jobs: async () => getJobs(10, 0),
  },
  Mutation: {
    createJob: async (_root, args) => {
      const { title, description } = args.input;
      const companyId = 'FjcJCHJALA4i';
      await delay(2000);
      return createJob({ title, description: description ?? '', companyId });
    },
    deleteJob: async (_root, args) => {
      const { input: jobId } = args;
      const deletedJob = await deleteJob(jobId);
      return deletedJob;
    },
    updateJob: async (_root, args) => {
      const { input: updatedFields } = args;
      const { id, description, title } = updatedFields;
      const updatedJob = await updateJob({
        id,
        title,
        description: description as string | undefined,
      });

      return updatedJob;
    },
  },
  Job: {
    date: (job) => toISODate(job.createdAt),
    company: async (job) => {
      const company = await getCompany(job.companyId);
      if (!company) {
        return notFoundError('Cannot find the company for this job: ' + job.id);
      }

      return company;
    },
  },
};
