import { readFileSync } from 'fs';

import { jobResolvers } from './job.resolvers.js';

const jobSchema = readFileSync(
  'apps/graphql-tutorial-server-esmodule/src/features/jobs/job.schema.graphql',
  { encoding: 'utf-8' }
);
export { jobResolvers, jobSchema };
