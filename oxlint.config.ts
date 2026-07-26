import { defineConfig } from "oxlint"

import react from "./config/oxlint/react.mjs"

export default defineConfig({
  extends: [react],
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: "error"
  }
})
