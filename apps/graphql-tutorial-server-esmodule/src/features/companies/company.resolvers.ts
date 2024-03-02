import { Company, getCompany } from '../../db/companies';
import { getJobsByCompany, Job } from '../../db/jobs';

export const companyResolvers = {
  Query: {
    company: async (_root: unknown, args: { id: string }): Promise<Company | undefined> =>
      getCompany(args.id),
  },

  Company: {
    jobs: (company: Company): Promise<Job[]> => getJobsByCompany(company.id),
  },
};
