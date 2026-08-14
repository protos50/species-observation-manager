import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Desactivar reglas de formato (Prettier maneja esto)
      'prettier/prettier': 'off',
      'max-len': 'off',
      'linebreak-style': 'off',
      indent: 'off',
      quotes: 'off',
      semi: ['warn', 'always'],
      'comma-dangle': 'off',
      'arrow-parens': 'off',
      'object-curly-spacing': 'off',

      // Desactivar reglas muy estrictas
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      'prefer-const': 'warn',
      'no-console': 'off',
      'no-debugger': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      '@next/next/no-img-element': 'warn',
    },
  },
]

export default eslintConfig
