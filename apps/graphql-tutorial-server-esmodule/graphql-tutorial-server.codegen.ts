import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/**/*.graphql',
  generates: {
    './__generated__/resolvers-types.ts': {
      config: {
        useIndexSignature: true,
      },
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },
  config: {
    contextType: '../src/main#Context',
    mappers: {
      Company: '../src/db/companies#CompanyEntity',
      Job: '../src/db/jobs#JobEntity',
    },
  },
};
export default config;
