import { readFileSync } from 'fs';

import { companyResolvers } from './company.resolvers.js';

const companySchema = readFileSync(
  'apps/graphql-tutorial-server-esmodule/src/features/companies/company.schema.graphql',
  { encoding: 'utf-8' }
);
export { companyResolvers, companySchema };
