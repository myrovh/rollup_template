/**
 * This is the base config for non app javascript that is intended to be run in
 * node. Just the basics here, recommended defaults, imports and node env
 * variables.
 */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  env: {
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
