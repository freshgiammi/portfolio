//@ts-check

import { defineConfig } from "oxlint"

import base from "./base.mjs"

// Compatibility matrix: https://github.com/oxc-project/oxc/issues/1022

export default defineConfig({
  extends: [base],
  plugins: ["react"],
  jsPlugins: [{ name: "react-refresh", specifier: "eslint-plugin-react-refresh" }],
  rules: {
    /*
     * ==========================================
     * Eslint Plugin
     * ==========================================
     */

    // https://oxc.rs/docs/guide/usage/linter/rules/eslint/class-methods-use-this.html
    "class-methods-use-this": [
      "error",
      {
        exceptMethods: [
          "render",
          "getInitialState",
          "getDefaultProps",
          "getChildContext",
          "componentWillMount",
          "UNSAFE_componentWillMount",
          "componentDidMount",
          "componentWillReceiveProps",
          "UNSAFE_componentWillReceiveProps",
          "shouldComponentUpdate",
          "componentWillUpdate",
          "UNSAFE_componentWillUpdate",
          "componentDidUpdate",
          "componentWillUnmount",
          "componentDidCatch",
          "getSnapshotBeforeUpdate"
        ]
      }
    ],

    /*
     * ==========================================
     * React Plugin
     * ==========================================
     */

    // https://oxc.rs/docs/guide/usage/linter/rules/react/display-name.html
    "react/display-name": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/react/jsx-no-comment-textnodes.html
    "react/jsx-no-comment-textnodes": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/react/jsx-no-useless-fragment.html
    "react/jsx-no-useless-fragment": "warn",
    // https://oxc.rs/docs/guide/usage/linter/rules/react/jsx-pascal-case.html
    "react/jsx-pascal-case": "warn",
    // https://oxc.rs/docs/guide/usage/linter/rules/react/jsx-no-target-blank.html
    "react/jsx-no-target-blank": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/react/no-unescaped-entities.html
    "react/no-unescaped-entities": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/react/no-unknown-property.html
    "react/no-unknown-property": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/react/require-render-return.html
    "react/require-render-return": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/react/self-closing-comp.html
    "react/self-closing-comp": "warn",
    // https://oxc.rs/docs/guide/usage/linter/rules/react/no-array-index-key.html
    "react/no-array-index-key": "warn",
    // https://oxc.rs/docs/guide/usage/linter/rules/react/no-children-prop.html
    "react/no-children-prop": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/react/rules-of-hooks.html
    "react/rules-of-hooks": "error",
    // https://oxc.rs/docs/guide/usage/linter/rules/react/exhaustive-deps.html
    "react/exhaustive-deps": "warn",
    // https://oxc.rs/docs/guide/usage/linter/rules/react/no-unstable-nested-components.html
    "react/no-unstable-nested-components": ["warn", { allowAsProps: true }],
    // https://oxc.rs/docs/guide/usage/linter/rules/react/react-compiler.html
    "react/react-compiler": "error",

    /*
     * ==========================================
     * React-refresh Plugin (via eslint-plugin-react-refresh as jsPlugin)
     * ==========================================
     */

    "react-refresh/only-export-components": [
      "warn",
      {
        allowConstantExport: true,
        extraHOCs: [
          "createFileRoute",
          "createLazyFileRoute",
          "createRootRoute",
          "createRootRouteWithContext",
          "createLink",
          "createRoute",
          "createLazyRoute"
        ]
      }
    ]
  }
})
