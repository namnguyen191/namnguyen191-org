module.exports = {
  'package.json': ['pnpm typecheck:all', 'pnpm lint:all', 'pnpm build:all'],
  '{apps,libs,tools}/**/*.{ts,tsx}': 'pnpm type-check:affected',
  '{apps,libs,tools}/**/*.{js,ts,jsx,tsx,json}': [
    'pnpm lint:affected',
    (files) => `pnpm nx format:write --files=${files.join(',')}`,
  ],
};
