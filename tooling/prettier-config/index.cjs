/** @typedef  {import("prettier").Config} PrettierConfig */

/** @type { PrettierConfig } */
const config = {
  endOfLine: 'auto',
  semi: true,
  useTabs: false,
  singleQuote: true,
  jsxSingleQuote: false,
  tabWidth: 2,
  trailingComma: 'none',
  bracketSpacing: true,
  arrowParens: 'always',
  singleAttributePerLine: true,
  tailwindStylesheet: './packages/ui/src/styles/globals.css',
  importOrder: [
    '^(react/(.*)$)|^(react$)',
    '^(next/(.*)$)|^(next$)',
    '<THIRD_PARTY_MODULES>',
    '^types$',
    '',
    '^@workspace/(.*)$',
    '',
    '^~/(.*)$',
    '^#(.*)$',
    '^[./]'
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  plugins: [
    'prettier-plugin-tailwindcss',
    '@ianvs/prettier-plugin-sort-imports'
  ]
};

module.exports = config;
