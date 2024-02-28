export const companyResolvers = {
  Query: {
    company: (): unknown => ({
      id: 'some-id',
      name: 'FedIck',
      description: 'Literrally modern slavery',
    }),
  },
};
