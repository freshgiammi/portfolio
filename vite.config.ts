import { createRequire } from "node:module"
import path from "node:path"

import { cloudflare } from "@cloudflare/vite-plugin"
import contentCollections from "@content-collections/vite"
import mdx from "@mdx-js/rollup"
import rehypeShiki from "@shikijs/rehype"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import autoprefixer from "autoprefixer"
import type { Element } from "hast"
import rehypeSlug from "rehype-slug"
import remarkFlexibleMarkers from "remark-flexible-markers"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkMdxFrontmatter from "remark-mdx-frontmatter"
import { defineConfig, loadEnv } from "vite"
import staticAssetsPlugin from "vite-static-assets-plugin"

import { buildInfo } from "./config/vite-plugins/buildinfo/index.ts"
import { imageOptimizer } from "./config/vite-plugins/image-optimizer/index.ts"
import { linkPreviews } from "./config/vite-plugins/link-previews/index.ts"
import { ogCards } from "./config/vite-plugins/og-cards/index.ts"
import { rehypeCallouts } from "./src/utils/markdown/callouts.ts"
import { remarkFileEmbed } from "./src/utils/markdown/file-embed.ts"
import { rehypeImageMarkers } from "./src/utils/markdown/image-markers.ts"
import { rehypeTweetEmbeds } from "./src/utils/markdown/tweet-embeds.ts"

// pnpm doesn't hoist a transitive dependency like this one to the root `node_modules/@tanstack/`,
// so it can't be resolved directly from this file — only from something that actually depends on
// it, like `@tanstack/react-router` itself. This also keeps working across a version bump, where
// pnpm's own store path would change.
const requireFromRouter = createRequire(import.meta.resolve("@tanstack/react-router/package.json"))
const routerCoreRoot = path.dirname(requireFromRouter.resolve("@tanstack/router-core/package.json"))

// @mdx-js/rollup strips the query string before applying its include/exclude filters, so no
// `exclude` pattern can keep `?raw` imports out of compilation. Bailing on the query here means
// those imports keep their literal text (Vite's own `?raw` handling) instead of becoming MDX
// components.
function mdxNoRaw(options: Parameters<typeof mdx>[0]) {
  const plugin = mdx(options)
  return {
    ...plugin,
    transform(this: unknown, value: string, id: string) {
      return /[?&]raw/.test(id) ? null : plugin.transform.call(this, value, id)
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
    resolve: {
      tsconfigPaths: true,
      alias: {
        // `@cloudflare/vite-plugin` resolves the worker/ssr build with the "browser" export
        // condition, since workerd is web-standard rather than Node — reasonable on its own, but
        // `@tanstack/router-core` also keys its `scroll-restoration-script` subpath on "browser" to
        // mean the opposite thing: "this is running in an end user's tab, post-hydration", where it
        // deliberately no-ops. The two collide, so the SSR render silently resolves to that no-op
        // instead of the real server-side script generator — the inline, pre-hydration scroll
        // restore never gets emitted, only the slower client-driven restore that runs after
        // hydration. Aliased straight to the concrete file to skip conditional-exports resolution
        // for just this one subpath, rather than touching `conditions` for the whole environment.
        "@tanstack/router-core/scroll-restoration-script": path.join(
          routerCoreRoot,
          "dist/esm/scroll-restoration-script/server.js"
        )
      }
    },
    plugins: [
      // First in the list: it owns the ssr environment the rest of the server build targets.
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      // Enforced pre, ahead of the React plugin, so `.mdx` files are already real components by the
      // time anything else sees them. Compiled by Vite's own bundler rather than a runtime evaluator
      // (`@content-collections/mdx`'s `mdx-bundler`, which resolves the compiled body through
      // `new Function` at request time) — Cloudflare Workers refuses dynamic code generation, so
      // that path fails in production no matter how it's wired up.
      {
        enforce: "pre",
        ...mdxNoRaw({
          remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm, remarkFileEmbed, remarkFlexibleMarkers],
          rehypePlugins: [
            rehypeCallouts,
            rehypeTweetEmbeds,
            rehypeImageMarkers,
            rehypeSlug,
            // `defaultLanguage` matters for a fenced block with no language at all (an ASCII tree,
            // plain output): without it, `@shikijs/rehype` silently leaves that `pre` untouched
            // instead of falling back to anything, so it never gets highlighted or scrolled like
            // every other code block.
            //
            // `parseMetaString` lifts two optional fenced-meta directives onto the `<code>` as
            // `data-*` attributes, which `Mdx`'s `pre` override reads into `CodeBlock`'s header:
            //   ```ts title="useParticles.ts"   -> filename "useParticles.ts"
            //   ```ts lang="typescript"          -> language override (else the fence info string)
            // The language badge is only offered when a `title` is present, so unlabeled blocks keep
            // rendering exactly as before — no site-wide header appears where an author didn't ask.
            [
              rehypeShiki,
              {
                themes: { light: "github-light", dark: "vesper" },
                defaultLanguage: "text",
                parseMetaString: (meta: string | undefined, node: Element) => {
                  const out: Record<string, string> = {}
                  const title = meta?.match(/(?:^|\s)title="([^"]+)"/)?.[1]
                  if (title) out["data-title"] = title
                  const lang = meta?.match(/(?:^|\s)lang="([^"]+)"/)?.[1]
                  if (lang) out["data-lang"] = lang
                  if (title || lang) {
                    const codeChild = node.children.find(
                      (child): child is Element => child.type === "element" && child.tagName === "code"
                    )
                    const cls = codeChild?.properties.className
                    const langClass = Array.isArray(cls) ? cls.find(c => c.startsWith("language-")) : undefined
                    if (langClass && !out["data-lang"]) {
                      const value = langClass.slice("language-".length)
                      if (value !== "text") out["data-lang"] = value
                    }
                  }
                  return out
                }
              }
            ]
          ]
        })
      },
      contentCollections(),
      tanstackStart({
        prerender: {
          enabled: true,
          // Every post/thought detail page is a dynamic `$slug` route, so it can't be listed as a
          // static seed path. Crawling follows the real `<a href>`s rendered on `/blog` and
          // `/thoughts` (and everywhere else a post or thought links to another), discovering every
          // detail page from there instead.
          crawlLinks: true,
          filter: page =>
            // Home's loader prefetches post stats, GitHub contributions, and the activity feed so
            // they don't pop in after the fact — but a static file gets built once and served from
            // Cloudflare's asset store with no worker involved ever again, so prerendering it would
            // freeze all three at whatever they read at build time.
            page.path !== "/" &&
            // A post's reads/likes/claps come from `usePostStats`, prefetched in the loader for the
            // same reason — prerendering these would freeze both the counts and (via the voter cookie)
            // whichever visitor happened to trigger the build as "having liked this" for every reader
            // after them. Left dynamic instead, same as home, so both stay correct and current on
            // every request.
            !page.path.startsWith("/blog") &&
            // The card renderer answers per page and caches its own output at the edge; a
            // prerendered copy would just be an html page sitting where an image belongs.
            !page.path.startsWith("/og")
        }
      }),
      react({ include: /\.(js|jsx|ts|tsx|mdx)$/ }),
      staticAssetsPlugin({
        // Optional configuration (defaults shown):
        directory: "public",
        ignore: [".DS_Store", "**/.DS_Store"],
        debounce: 200,
        enableDirectoryTypes: true,
        maxDirectoryDepth: 5
      }),
      linkPreviews(),
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
      buildInfo({
        mode: env.MODE === "production" ? "production" : "development"
      }),
      ogCards()
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
      target: "esnext",
      minify: "oxc"
    }
  }
})
