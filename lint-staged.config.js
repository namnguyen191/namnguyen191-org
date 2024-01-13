module.exports = {
  '{apps,libs,tools}/**/*.{ts,tsx}': (files) => {
    return `pnpm nx affected --target=typecheck --files=${files.join(',')}`;
  },
  '{apps,libs,tools}/**/*.{js,ts,jsx,tsx,json}': [
    (files) => `pnpm nx affected:lint --files=${files.join(',')}`,
    (files) => `pnpm nx format:write --files=${files.join(',')}`,
  ],
};
