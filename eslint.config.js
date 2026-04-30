import tseslint from 'typescript-eslint';

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      curly: ['error', 'all'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'no-multi-spaces': 'error',
      'padded-blocks': ['error', 'never'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
  },
];