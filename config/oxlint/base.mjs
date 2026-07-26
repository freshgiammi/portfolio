//@ts-check

import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

import { defineConfig } from "oxlint"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Missing rules (not yet available in oxlint):
// typescript/naming-convention
// import/no-unresolved
// react/jsx-no-leaked-render
// max-len

export default defineConfig({
  plugins: ["eslint", "oxc", "typescript", "unicorn", "import"],
  jsPlugins: [
    "eslint-plugin-simple-import-sort",
    { name: "portfolio", specifier: resolve(__dirname, "rules/index.mjs") },
    { name: "@tanstack/router", specifier: "@tanstack/eslint-plugin-router" }
  ],
  categories: {
    correctness: "error"
  },
  env: {
    builtin: true,
    es2026: true
  },
  ignorePatterns: ["**/.turbo/**", "**/build/**", "**/dist/**", "**/node_modules/**", "**/*.d.ts", "**/*.md"],
  overrides: [
    {
      files: ["config/oxlint/**/*.mjs", "config/oxlint/**/*.ts"],
      rules: {
        "typescript/no-unsafe-member-access": "off",
        "typescript/no-unsafe-call": "off",
        "no-unused-vars": "off",
        "simple-import-sort/imports": "off",
        "simple-import-sort/exports": "off"
      }
    }
  ],
  rules: {
    /*
     * ==========================================
     * Eslint Plugin
     * ==========================================
     */

    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-var.html
    "no-var": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-unused-vars.html
    "no-unused-vars": [
      "error",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
        fix: {
          imports: "safe-fix",
          variables: "off"
        }
      }
    ],
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-const.html
    "prefer-const": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-rest-params.html
    "prefer-rest-params": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-spread.html
    "prefer-spread": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-array-constructor.html
    "no-array-constructor": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-case-declarations.html
    "no-case-declarations": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-empty.html
    "no-empty": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-fallthrough.html
    "no-fallthrough": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-prototype-builtins.html
    "no-prototype-builtins": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-regex-spaces.html
    "no-regex-spaces": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-self-compare.html
    "no-self-compare": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-unexpected-multiline.html
    "no-unexpected-multiline": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-nested-ternary.html
    "no-nested-ternary": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-await-in-loop.html
    "no-await-in-loop": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-param-reassign.html
    "no-param-reassign": ["error", { props: true, ignorePropertyModificationsFor: ["acc"] }],
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-console.html
    "no-console": ["warn", { allow: ["error", "warn"] }],
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-bitwise.html
    "no-bitwise": ["error", { allow: ["^"] }],
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/prefer-arrow-callback.html
    "prefer-arrow-callback": ["warn", { allowNamedFunctions: true }],
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/arrow-body-style.html
    "arrow-body-style": ["warn", "as-needed"],
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-return-assign.html
    "no-return-assign": ["error", "except-parens"],
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/new-cap.html
    "new-cap": ["error", { newIsCapExceptions: ["jsPDF"], capIsNewExceptions: ["IMask", "UAParser"] }],
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/default-param-last.html
    "default-param-last": "warn",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-redeclare.html
    "no-redeclare": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-shadow.html
    "no-shadow": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-unused-expressions.html
    "no-unused-expressions": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-use-before-define.html
    "no-use-before-define": ["error", { functions: false }],
    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-irregular-whitespace.html
    "no-irregular-whitespace": "error",

    /*
     * ==========================================
     * Import Plugin
     * ==========================================
     */

    // https://oxc.rs/docs/guide/usage/linter/rules/import/first.html
    "import/first": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/import/no-cycle.html
    "import/no-cycle": "warn",
    // https://oxc.rs/docs/guide/usage/linter/rules/import/no-duplicates.html
    "import/no-duplicates": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/import/export.html
    "import/export": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/import/no-named-as-default.html
    "import/no-named-as-default": "warn",
    // https://oxc.rs/docs/guide/usage/linter/rules/import/newline-after-import.html
    "import/newline-after-import": "error",

    /*
     * ==========================================
     * Import sorting Plugin (via eslint-plugin-simple-import-sort as jsPlugin)
     * ==========================================
     */

    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",

    /*
     * ==========================================
     * Custom portfolio rules (via jsPlugin)
     * ==========================================
     */

    "portfolio/no-private-folder-import": "warn",
    "portfolio/no-unwrapped-text-in-fragment": "warn",
    "portfolio/require-form-id": "warn",

    /*
     * ==========================================
     * TanStack Router Plugin (via jsPlugin)
     * ==========================================
     */

    "@tanstack/router/create-route-property-order": "warn",
    "@tanstack/router/route-param-names": "error",

    /*
     * ==========================================
     * Typescript Plugin
     * ==========================================
     */

    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/ban-ts-comment.html
    "typescript/ban-ts-comment": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/consistent-type-imports.html
    "typescript/consistent-type-imports": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-explicit-any.html
    "typescript/no-explicit-any": ["warn", { ignoreRestArgs: true }],
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-namespace.html
    // Set to off because the codebase uses `declare namespace` for component type merging
    // and oxlint doesn't support the allowDeclarations option
    "typescript/no-namespace": "off",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-require-imports.html
    "typescript/no-require-imports": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-type-constraint.html
    "typescript/no-unnecessary-type-constraint": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unsafe-function-type.html
    "typescript/no-unsafe-function-type": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-misused-promises.html
    "typescript/no-misused-promises": [
      "error",
      { checksVoidReturn: { arguments: false, attributes: false, properties: false } }
    ],
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-empty-object-type.html
    "typescript/no-empty-object-type": ["error", { allowInterfaces: "with-single-extends" }],
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-type-conversion.html
    "typescript/no-unnecessary-type-conversion": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-type-assertion.html
    "typescript/no-unnecessary-type-assertion": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-boolean-literal-compare.html
    "typescript/no-unnecessary-boolean-literal-compare": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-type-parameters.html
    "typescript/no-unnecessary-type-parameters": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-type-arguments.html
    "typescript/no-unnecessary-type-arguments": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-condition.html
    "typescript/no-unnecessary-condition": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-template-expression.html
    "typescript/no-unnecessary-template-expression": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unsafe-call.html
    "typescript/no-unsafe-call": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unsafe-enum-comparison.html
    "typescript/no-unsafe-enum-comparison": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unsafe-member-access.html
    "typescript/no-unsafe-member-access": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/only-throw-error.html
    "typescript/only-throw-error": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-promise-reject-errors.html
    "typescript/prefer-promise-reject-errors": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/require-await.html
    "typescript/require-await": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/restrict-plus-operands.html
    "typescript/restrict-plus-operands": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/consistent-return.html
    "typescript/consistent-return": "warn"
  }
})
