module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['src/idl'],
  plugins: ['@typescript-eslint', 'jest', 'eslint-plugin-tsdoc'],
  extends: [
    'standard-with-typescript',
    'prettier',
    'plugin:jest/recommended',
    'plugin:import/errors',
    'plugin:import/typescript'
  ],
  parserOptions: {
    project: ['./tsconfig.eslint.json']
  },
  rules: { 'tsdoc/syntax': 'warn' }
};