import { fileURLToPath } from "node:url"

import type { StorybookConfig } from "@storybook/tanstack-react"

// Node ESM loads this file directly, so the explicit filename (not a directory import).

const config: StorybookConfig = {
  // Deliberately no `**/*.mdx` entry: it would sweep up src/content posts and thoughts and feed
  // them through the MDX compiler, which errors out on them.
  stories: ["../**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/tanstack-react",
  // The default react-docgen parser bails on this repo's parts-object pattern (`export const X =
  // { Root }` merged with `export declare namespace X`), leaving every prop description empty.
  // The experimental LanguageService extractor reads the same JSDoc the editor shows, including
  // for non-exported members of the parts objects.
  features: {
    experimentalReactComponentMeta: true
  },
  core: {
    builder: {
      name: "@storybook/builder-vite",
      // Dedicated config supplying what the app's own vite.config.ts would: the `@/` alias,
      // scss loadPaths, autoprefixer, and the server-function mocks (see vite.config.ts).
      options: {
        viteConfigPath: fileURLToPath(import.meta.resolve("./vite.config.ts"))
      }
    }
  }
}

export default config
