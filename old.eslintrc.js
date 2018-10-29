module.exports = {
  env: {
    browser: false,
    es6: true
  },
  extends: ["eslint:recommended", "plugin:node/recommended"],
  parserOptions: {
    ecmaVersion: 2017
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "single"],
    semi: ["error", "always"],
    "no-multiple-empty-lines": [1, { max: 2, maxEOF: 1 }],
    "no-trailing-spaces": [1, { skipBlankLines: false }],
    "no-mixed-spaces-and-tabs": [1],
    "no-unused-vars": [1, { allow: ["warn", "error"] }],
    "no-console": [1, { allow: ["warn", "error"] }]
  }
};
