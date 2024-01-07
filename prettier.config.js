/** @type {import("prettier").Config} */
const config = {
    trailingComma: 'es5',
    tabWidth: 2,
    singleQuote: true,
    printWidth: 100,
    plugins: ['prettier-plugin-tailwindcss'],
};

module.exports = config;
