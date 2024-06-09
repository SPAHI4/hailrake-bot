/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import drizzle from 'eslint-plugin-drizzle';
import eslintPluginImport from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    plugins: { drizzle: drizzle },
    rules: drizzle.configs.recommended.rules,
  },
  eslintConfigPrettier,
  {
    plugins: { import: eslintPluginImport },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off', // easier to use string concatenation and number formatting
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigDirName: import.meta.dirname,
      },
    },
  },
];
