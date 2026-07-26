import { createEnv } from "@t3-oss/env-core"
import * as v from "valibot"

export const env = createEnv({
  clientPrefix: "VITE_",
  shared: {
    NODE_ENV: v.picklist(["development", "production", "test"])
  },
  client: {
    VITE_SITE_URL: v.optional(v.string())
  },
  runtimeEnv: {
    NODE_ENV: import.meta.env.MODE,
    VITE_SITE_URL: import.meta.env.VITE_SITE_URL
  },
  emptyStringAsUndefined: true
})
