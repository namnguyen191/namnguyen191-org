import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';

import baseConfigs from './eslint.config.js';

const angularConfigs = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  }
);

export default [...baseConfigs, ...angularConfigs];
