import DataLoader from 'dataloader';

import { connection } from './connection.js';

export type CompanyEntity = {
  id: string;
  name: string;
  description: string;
};

// certain types are not being export by knex so the only way to get access to them is by type infer
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getCompanyTable = () => connection.table<CompanyEntity>('company');

export const getCompany = async (id: string): Promise<CompanyEntity | undefined> => {
  return await getCompanyTable().first().where({ id });
};

export const createCompanyLoader = (): DataLoader<unknown, any, unknown> => {
  return new DataLoader(async (ids) => {
    const companies = await getCompanyTable()
      .select()
      .whereIn('id' as any, ids as any);
    return ids.map((id) => companies.find((company) => company.id === id));
  });
};
