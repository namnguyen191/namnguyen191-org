import nxEslintPlugin from '@nx/eslint-plugin';
import nx from '@nx/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import jsonParser from 'jsonc-eslint-parser';

export default [
  {
    ignores: [
      '**/vite.config.ts',
      '**/cypress.config.ts ',
      '**/tailwind.config.js',
      '**/tailwind.config.cjs',
      '**/postcss.config.js',
      '**/postcss.config.cjs',
      '**/prettier.config.js',
      '**/node_modules',
      '**/eslint*.js',
      '**/lint-staged.config.js',
    ],
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    plugins: {
      '@nx': nxEslintPlugin,
      prettier: eslintPluginPrettier,
      'simple-import-sort': eslintPluginSimpleImportSort,
    },
  },
  {
    rules: {
      'prettier/prettier': ['error'],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'missing-tag',
              onlyDependOnLibsWithTags: ['*'],
            },
            {
              sourceTag: 'scope:dui-core',
              onlyDependOnLibsWithTags: ['scope:shared-lib', 'scope:shared-lib:angular'],
            },
            {
              sourceTag: 'scope:dui-extensions',
              onlyDependOnLibsWithTags: [
                'scope:dui-core',
                'scope:shared-lib',
                'scope:shared-lib:angular',
                'scope:dui-extensions',
              ],
            },
            {
              sourceTag: 'scope:shared-lib:angular',
              onlyDependOnLibsWithTags: ['scope:shared-lib', 'scope:shared-lib:angular'],
            },
            {
              sourceTag: 'scope:shrimping-around:main',
              onlyDependOnLibsWithTags: ['/^scope:shrimping-around:feature:.*/'],
            },
            {
              sourceTag: 'scope:shared-lib',
              onlyDependOnLibsWithTags: ['scope:shared-lib'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {
      indent: 'off',
      '@typescript-eslint/explicit-function-return-type': 'error',
      'comma-dangle': 'off',
      'naming-convention': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      'no-extra-semi': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        { ignoredDependencies: ['@nx/devkit', 'vitest', '@nx/vite', '@swc/helpers'] },
      ],
    },
    languageOptions: { parser: jsonParser },
  },
  eslintConfigPrettier,
];
