import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const sharedRules = {
  ...reactHooks.configs.flat.recommended.rules,
  // React 17+ JSX transform — React doesn't need to be in scope
  'no-unused-vars': ['error', { varsIgnorePattern: '^React$', destructuredArrayIgnorePattern: '^_', args: 'none' }],
  // These react-hooks v7 rules flag common valid patterns (async loaders, guards)
  'react-hooks/set-state-in-effect': 'off',
  'react-hooks/immutability': 'off',
  'react-hooks/preserve-manual-memoization': 'off',
}

const sharedLanguageOptions = {
  globals: { ...globals.browser, ...globals.node },
}

export default defineConfig([
  globalIgnores(['dist', '.next', 'node_modules']),

  // JS / JSX
  {
    files: ['**/*.{js,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...js.configs.recommended.rules,
      ...sharedRules,
    },
    languageOptions: {
      ...sharedLanguageOptions,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  // TS / TSX — use typescript-eslint parser so type annotations don't cause parse errors
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      ...sharedLanguageOptions,
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...sharedRules,
    },
  },
])
