module.exports = {
    env: {
        browser: false,
        es6: true
    },
    extends: ['eslint:recommended', 'plugin:node/recommended'],
    parserOptions: {
        ecmaVersion: 2017
    },
    rules: {
        indent: ['error', 4],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'always']
    }
};
