import { CompanyEntity, getCompany } from '../../db/companies';
import { getJobsByCompany, JobEntity } from '../../db/jobs';
import { notFoundError } from '../../utils/graphql-helpers';

export const companyResolvers = {
  Query: {
    company: async (_root: unknown, args: { id: string }): Promise<CompanyEntity> => {
      const { id } = args;
      const company = await getCompany(id);
      if (!company) {
        return notFoundError(`No company found with id ${id}`);
      }
      return company;
    },
  },

  Company: {
    jobs: (company: CompanyEntity): Promise<JobEntity[]> => getJobsByCompany(company.id),
  },
};
