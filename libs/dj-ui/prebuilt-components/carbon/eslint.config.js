import baseAngularConfig from '../../../../eslint-angular.config.js';

export default [
  ...baseAngularConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'dj-ui-carbon',
          style: 'kebab-case',
        },
      ],
    },
  },
];
