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
    'no-underscore-dangle': 'off',
  },
  plugins: ['import'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js'],
        moduleDirectory: ['node_modules'],
      },
      alias: {
        map: [
          ['#app', './app.js'],
          ['#controllers', './controllers/index.js'],
          ['#models', './models/index.js'],
          ['#repositories', './repositories/index.js'],
          ['#routes', './routes/index.js'],
          ['#services', './services/index.js'],
          ['#config', './config.js'],
          ['#utils', './utils/index.js'],
          ['#middleware', './middleware/index.js'],
          ['#database', './database/database.js'],
        ],
        extensions: ['.js'],
      },
    },
  },
};
