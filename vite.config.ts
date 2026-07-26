import { cloudflare } from "@cloudflare/vite-plugin"
import contentCollections from "@content-collections/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import autoprefixer from "autoprefixer"
import { defineConfig, loadEnv } from "vite"
import staticAssetsPlugin from "vite-static-assets-plugin"

import { buildInfo } from "./config/vite-plugins/buildinfo"
import { imageOptimizer } from "./config/vite-plugins/image-optimizer"
import { ogImages } from "./config/vite-plugins/og"
import { serverDomParser } from "./config/vite-plugins/server-dom-parser"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
    resolve: {
      tsconfigPaths: true
    },
    plugins: [
      // First in the list: it owns the ssr environment the rest of the server build targets.
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      contentCollections(),
      devtools(),
      tanstackStart(),
      react(),
      staticAssetsPlugin({
        // Optional configuration (defaults shown):
        directory: "public",
        ignore: [".DS_Store", "**/.DS_Store"],
        debounce: 200,
        enableDirectoryTypes: true,
        maxDirectoryDepth: 5
      }),
      ogImages(),
      imageOptimizer({
        // The plugin's defaults re-encode at quality 100, which makes an already-compressed jpeg
        // bigger than the original, and it then skips every one of them.
        jpg: { quality: 80, mozjpeg: true },
        jpeg: { quality: 80, mozjpeg: true },
        png: { quality: 80, compressionLevel: 9 },
        webp: { quality: 80 }
        // No `cache`: the plugin keys its cache on the file path alone, with no content hash, so a
        // regenerated asset that keeps its name (every OG card) would be served last build's bytes
        // forever. It bought about a second on a full build, which is not worth stale output.
      }),
      serverDomParser(),
      buildInfo({
        mode: env.MODE === "production" ? "production" : "development"
      })
    ],
    css: {
      postcss: {
        plugins: [autoprefixer()]
      },
      preprocessorOptions: {
        scss: {
          // Lets any module reach the shared partials by name, instead of counting `../` up to
          // `src/styles`.
          loadPaths: ["src/styles"]
        }
      }
    },
    build: {
      outDir: "build",
      target: "esnext"
    }
  }
})
