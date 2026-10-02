import js from '@eslint/js';
export default [js.configs.recommended, { ignores: ['dist/**', 'node_modules/**', 'release/**'], rules: { 'no-unused-vars': 'off' } }];
