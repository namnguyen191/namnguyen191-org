/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import { merge } from 'lodash-es';
import * as path from 'path';
import { fileURLToPath, URL } from 'url';

import { jobResolvers, jobSchema } from './features/jobs/index.js';
import { queryResolvers, querySchema } from './features/query/index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(cors(), express.json());

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to graphql-tutorial-server-esmodule!' });
});

const typeDefs = [querySchema, jobSchema];
const resolvers = merge({}, queryResolvers, jobResolvers);
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});
await apolloServer.start();
app.use('/graphql', expressMiddleware(apolloServer));

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/api`);
  console.log(`Graphql listening at http://localhost:${port}/graphql`);
});
server.on('error', console.error);
