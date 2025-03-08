import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import stylisticTs from '@stylistic/eslint-plugin-ts'
import { globalIgnores } from "eslint/config"

/** @type {import('eslint').Linter.Config[]} */
export default [
  globalIgnores(["dist/"]),
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  {
    plugins: {
      '@stylistic/ts': stylisticTs
    },
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@stylistic/ts/semi': ["error", "never"],
    },
  },
]