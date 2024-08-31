const config = {
  './package.json': ['pnpm typecheck:all', 'pnpm lint:all', 'pnpm stylelint:all', 'pnpm build:all'],
  '{apps,libs,tools}/**/*.{ts,tsx}': 'pnpm type-check:affected',
  '{apps,libs,tools}/**/*.{css,scss}': 'pnpm stylelint:affected',
  '{apps,libs,tools}/**': 'pnpm build:affected',
  '{apps,libs,tools}/**/*.{js,ts,jsx,tsx,json,html}': [
    (files) => `pnpm nx affected:lint --files=${files.join(',')}`,
    (files) => `pnpm nx format:write --files=${files.join(',')}`,
  ],
  '{apps,libs,tools}/**/*.{css,scss}': [
    (files) => `pnpm nx format:write --files=${files.join(',')}`,
  ],
};

export default config;
