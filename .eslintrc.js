module.exports = {
  extends: [require.resolve('eslint-config-codfish')].filter(Boolean),
  root: true,
  rules: {
    'no-console': 'off',
    'no-plusplus': 'off',
    'no-bitwise': 'off',
    'no-restricted-syntax': 'off'
  },
  env: {
    mocha: true,
  },
  globals: {
    'BigInt':true
  },
};
