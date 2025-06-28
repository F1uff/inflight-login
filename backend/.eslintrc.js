module.exports = {
    env: {
        node: true,
        es2021: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        'no-console': 'off',
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }]
    },
    globals: {
        'require': 'readonly',
        'module': 'readonly',
        'process': 'readonly',
        '__dirname': 'readonly',
        '__filename': 'readonly',
        'global': 'readonly',
        'Buffer': 'readonly'
    }
}; 