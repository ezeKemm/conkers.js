import prettier from 'eslint-config-prettier';
import globals from "globals";
import js from "@eslint/js";
import ts from "typescript-eslint";
// import { defineConfig } from "eslint/config";
import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';
const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url)); 

export default ts.config(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  }

)