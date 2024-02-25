/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import { readFile } from 'fs/promises';
import * as path from 'path';

import { resolvers } from './resolver';

const start = async (): Promise<void> => {
  const app = express();

  app.use('/assets', express.static(path.join(__dirname, 'assets')));

  app.use(cors(), express.json());

  app.get('/api', (req, res) => {
    res.send({ message: 'Welcome to graphql-tutorial-server!' });
  });

  const typeDefs = await readFile('./apps/graphql-tutorial-server/src/schema.graphql', 'utf8');
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  app.use('/graphql', expressMiddleware(apolloServer));

  const port = process.env.PORT || 3333;
  const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}/api`);
    console.log(`Graphql listening at http://localhost:${port}/graphql`);
  });
  server.on('error', console.error);
};

start();
