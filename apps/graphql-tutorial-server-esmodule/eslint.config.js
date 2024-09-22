import baseConfig from '../../eslint.config.js';

export default [
  ...baseConfig,
  {
    ignores: ['**/__generated__/**'],
  },
];
