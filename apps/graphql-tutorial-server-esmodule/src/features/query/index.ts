import { readFileSync } from 'fs';

import { queryResolvers } from './query.resolvers.js';

const querySchema = readFileSync(
  'apps/graphql-tutorial-server-esmodule/src/features/query/query.schema.graphql',
  { encoding: 'utf-8' }
);
export { queryResolvers, querySchema };
