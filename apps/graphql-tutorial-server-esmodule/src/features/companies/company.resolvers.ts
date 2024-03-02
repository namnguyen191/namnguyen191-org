import { Company, getCompany } from '../../db/companies';

export const companyResolvers = {
  Query: {
    company: async (_root: unknown, args: { id: string }): Promise<Company | undefined> =>
      getCompany(args.id),
  },
};
