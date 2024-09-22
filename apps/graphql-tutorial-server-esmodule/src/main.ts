/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import DataLoader from 'dataloader';
import express from 'express';
import { merge } from 'lodash-es';
import * as path from 'path';
import { fileURLToPath, URL } from 'url';

import { authMiddleware, getUserFromRequest, handleLogin } from './auth.js';
import { CompanyEntity, createCompaniesLoader } from './db/companies.js';
import { User } from './db/users.js';
import { companyResolvers, companySchema } from './features/companies/index.js';
import { jobResolvers, jobSchema } from './features/jobs/index.js';
import { queryResolvers, querySchema } from './features/query/index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(cors(), express.json(), authMiddleware);

app.post('/login', handleLogin);

app.get('/api', (_req, res) => {
  res.send({ message: 'Welcome to graphql-tutorial-server-esmodule!' });
});

export type Context = {
  user: User | null;
  companiesLoader: DataLoader<string, CompanyEntity, string>;
};

const typeDefs = [querySchema, jobSchema, companySchema];
const resolvers = merge({}, queryResolvers, jobResolvers, companyResolvers);
const apolloServer = new ApolloServer<Context>({
  typeDefs,
  resolvers,
});
await apolloServer.start();
app.use(
  '/graphql',
  expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      const user = await getUserFromRequest(req);
      const companiesLoader = createCompaniesLoader();
      return {
        user,
        companiesLoader,
      };
    },
  })
);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/api`);
  console.log(`Graphql listening at http://localhost:${port}/graphql`);
});
server.on('error', console.error);
