export const queryResolvers = {
  Query: {
    healthCheck: (): string => 'Graphql is working!',
  },
  Mutation: {
    healthCheck: (): string => 'Graphql is working!',
  },
};
