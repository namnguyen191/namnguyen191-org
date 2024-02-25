import { gql } from 'graphql-tag';

export const queryTypeDef = gql`
  type Query {
    healthCheck: String
  }
`;

export const queryResolvers = {
  Query: {
    healthCheck: (): string => 'Graphql is working!',
  },
};
