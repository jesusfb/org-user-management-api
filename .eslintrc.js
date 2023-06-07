module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 'off',
    'import/no-extraneous-dependencies': 'off',
    'object-curly-newline': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
    'implicit-arrow-linebreak': 'off',
    'function-paren-newline': 'off',
    'no-await-in-loop': 'off',
    'no-plusplus': 'off',
  },
};
