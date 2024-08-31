import { delay } from '@namnguyen191/common-js-helper';

import {
  JobResolvers,
  MutationResolvers,
  QueryResolvers,
} from '../../../__generated__/resolvers-types.js';
import { countJobs, createJob, deleteJob, getJob, getJobs, updateJob } from '../../db/jobs.js';
import { notFoundError, unauthorizedError } from '../../utils/graphql-helpers.js';

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
    jobs: async (_root, { limit, offset }) => {
      const totalCount = await countJobs();
      const jobs = await getJobs(limit ?? 10, offset ?? 0);
      return {
        items: jobs,
        totalCount,
      };
    },
  },
  Mutation: {
    createJob: async (_root, args, ctx) => {
      const { user } = ctx;
      if (!user) {
        return unauthorizedError('Please login to perform this action');
      }
      const { title, description } = args.input;
      const companyId = user.companyId;
      await delay(2000);
      return createJob({ title, description: description ?? '', companyId });
    },
    deleteJob: async (_root, args, { user }) => {
      if (!user) {
        return unauthorizedError('Please login to perform this action');
      }
      const { input: jobId } = args;
      const deletedJob = await deleteJob(jobId, user.companyId);
      if (!deletedJob) {
        return notFoundError('Job not found');
      }
      return deletedJob;
    },
    updateJob: async (_root, args, { user }) => {
      if (!user) {
        return unauthorizedError('Please login to perform this action');
      }
      const { input: updatedFields } = args;
      const { id, description, title } = updatedFields;
      const updatedJob = await updateJob({
        id,
        title,
        description: description as string | undefined,
        userCompanyId: user.companyId,
      });

      if (!updatedJob) {
        return notFoundError('Job not found');
      }

      return updatedJob;
    },
  },
  Job: {
    date: (job) => toISODate(job.createdAt),
    company: async (job, _args, { companiesLoader }) => companiesLoader.load(job.companyId),
  },
};
