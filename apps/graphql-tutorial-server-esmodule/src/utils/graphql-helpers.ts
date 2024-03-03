import { GraphQLError } from 'graphql';

export const notFoundError = (msg: string): never => {
  throw new GraphQLError(msg, {
    extensions: { code: 'NOT_FOUND' },
  });
};
