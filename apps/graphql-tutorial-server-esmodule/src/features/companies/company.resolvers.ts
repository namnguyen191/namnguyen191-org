import { Company, getCompany } from '../../db/companies';
import { getJobsByCompany, Job } from '../../db/jobs';
import { notFoundError } from '../../utils/graphql-helpers';

export const companyResolvers = {
  Query: {
    company: async (_root: unknown, args: { id: string }): Promise<Company> => {
      const { id } = args;
      const company = await getCompany(id);
      if (!company) {
        return notFoundError(`No company found with id ${id}`);
      }
      return company;
    },
  },

  Company: {
    jobs: (company: Company): Promise<Job[]> => getJobsByCompany(company.id),
  },
};
