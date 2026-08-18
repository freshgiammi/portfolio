import { defineConfig } from "oxlint"

import react from "./config/oxlint/react.mjs"

export default defineConfig({
  extends: [react],
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: "error"
  },
  rules: {
    // Off, not "error": this repo's own convention pairs a component function with a same-named
    // `export declare namespace Foo { export type Props = … }` for declaration merging, which this
    // rule (as of oxlint 1.79's rewrite: https://github.com/oxc-project/oxc/pull/25691) can no longer
    // tell apart from a genuine redeclaration.
    "no-redeclare": "off"
  },
  overrides: [
    {
      // The manager bundle's .d.ts is a single minified re-export chunk that tsgolint cannot
      // resolve, so every `addons`/`useGlobals` value reads as `error`-typed there. tsc passes.
      files: ["src/storybook/**/*.{ts,tsx}"],
      rules: {
        "typescript/no-unsafe-call": "off",
        "typescript/no-unsafe-member-access": "off",
        "typescript/no-unsafe-assignment": "off",
        "typescript/no-unsafe-return": "off"
      }
    }
  ]
})
