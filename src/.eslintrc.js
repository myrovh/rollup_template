/**
 * This is the config for linting the actual src code that will be compiled into
 * the app. Typescript is only intended to be used here in src and is checked
 * against type specific rules, import validation, react, a11y and react hook rules.
 * Formatting rules are disabled because we use prettier for that.
 */
module.exports = {
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: { es2020: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  plugins: ['react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:sonarjs/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
}
