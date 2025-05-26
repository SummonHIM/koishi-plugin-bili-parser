import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["lib/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js, prettier: eslintPluginPrettier },
    extends: ["js/recommended", prettier],
    rules: { "prettier/prettier": ["error", { semi: true }] },
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
]);
