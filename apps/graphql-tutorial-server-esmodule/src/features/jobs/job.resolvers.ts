export const jobResolvers = {
  Query: {
    job: (): unknown => ({
      id: 'some-id',
      title: 'Package handler',
      description: 'Basically modern slavery',
    }),
    jobs: (): unknown => {
      return [
        {
          id: 'some-id-1',
          title: 'Package handler',
          description: 'Basically modern slavery',
        },
        {
          id: 'some-id-2',
          title: 'Driver',
          description: 'Good luck LOL',
        },
      ];
    },
  },
};
