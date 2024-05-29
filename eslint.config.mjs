import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strict,
    {
        files: ['src/**/*.ts', 'tests/**/*.ts'],
        languageOptions: {
            ecmaVersion: 2015,
            sourceType: 'commonjs',
            parserOptions: {
                project: './tsconfig.json'
            }
        },
        rules: {
            'no-throw-literal': 'off',
            '@typescript-eslint/only-throw-error': 'error'
        }
    }
);
