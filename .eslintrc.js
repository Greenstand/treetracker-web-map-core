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
    'plugin:import/recommended',
    'prettier', // must be last
  ],
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
  },
}
