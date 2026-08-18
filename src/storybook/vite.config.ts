import path from "node:path"

import react from "@vitejs/plugin-react"
import autoprefixer from "autoprefixer"
import { defineConfig } from "vite"

import { buildInfo } from "../../config/vite-plugins/buildinfo"
import { linkPreviews } from "../../config/vite-plugins/link-previews/index.ts"

/*
 * Dedicated Vite config for the Storybook iframe, passed to the builder via
 * `core.builder.options.viteConfigPath` (see main.ts).
 *
 * Storybook does not read the app's own vite.config.ts, and without an explicit config its
 * resolver has no knowledge of the `@/*` tsconfig paths — which broke silently when this folder
 * moved under `src`. Everything here mirrors the relevant parts of the app config.
 */
const srcDir = path.resolve(import.meta.dirname, "..")
const rootDir = path.resolve(srcDir, "..")

export default defineConfig({
  // Storybook's iframe server has no public dir of its own; without this, /fonts and /images 404.
  publicDir: path.resolve(rootDir, "public"),
  plugins: [
    react(),
    // Provides `virtual:buildinfo` (and `virtual:config`) from the real git repo, so the build
    // footer story shows live data instead of needing a stub.
    buildInfo({ mode: "development" }),
    // Provides `virtual:link-images` for the data modules that call `previewUrl(...)`. Storybook's
    // Vite root is src/, so the source dir and shared cache are given relative to the repo root.
    linkPreviews({
      sourceDir: path.resolve(rootDir, "src"),
      cacheFile: path.resolve(rootDir, "node_modules/.cache/link-images.json")
    })
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      // Specific aliases first: Vite matches string keys as prefixes, so a bare "@" would win
      // over "@/server/*" if it came first.
      // Mocking the platform module (rather than each server file) keeps the real server
      // functions as the single source of truth; stories override them via mocked().
      "cloudflare:workers": path.resolve(import.meta.dirname, "./lib/mocks/cloudflare-workers.ts"),
      // The real virtual module comes from the app's staticAssetsPlugin, which regenerates its
      // .d.ts on every run and misplaces it under this config dir. In dev, asset urls are
      // publicDir-relative either way, so an identity function is exact.
      "virtual:static-assets": path.resolve(import.meta.dirname, "./lib/mocks/static-assets.ts")
    }
  },
  css: {
    postcss: { plugins: [autoprefixer()] },
    preprocessorOptions: {
      scss: {
        // Lets any module reach the shared partials by name, instead of counting `../` up to
        // `src/styles`.
        loadPaths: [path.resolve(srcDir, "styles")]
      }
    }
  }
})
