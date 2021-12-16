module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true,
    'cypress/globals': true,
    node: true,
  },
  plugins: ['jest', 'cypress'],
  extends: [
    'eslint:recommended',
    'prettier', // must be last
  ],
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'no-unused-vars': 'warn',
  },
}
