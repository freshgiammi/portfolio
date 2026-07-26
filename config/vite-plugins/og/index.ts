import path from "node:path"
import process from "node:process"

import { createLogger, createServer, type Plugin, type ViteDevServer } from "vite"

import { collectRouteCards } from "./routes"

/**
 * Every OG card is a file, not a request.
 *
 * The inputs (page metadata, post frontmatter, thought bodies) all live in the repo and already
 * require a deploy to change, so nothing about these images is dynamic. Rendering them into the
 * client output keeps takumi out of the worker bundle entirely, and lets the CDN answer the crawlers
 * that would otherwise wait on a cold wasm render.
 *
 * In dev the same targets render on request, so renaming a post or adding a page shows up on the
 * next request without a build.
 */

const logger = createLogger("info", { prefix: "[og]" })

/** Posts whose card is pointless in production, because the route itself 404s there. */
const DEV_ONLY_SLUGS = ["markdown-test"]

const POST_EMOJI = "✍️"
const THOUGHT_EMOJI = "💭"
const POST_FALLBACK_DESCRIPTION = "A post on freshgiammi.dev about software and frontend engineering."

type OgTarget = {
  /** Route path the card belongs to; the file name is derived from it. */
  path: string
  title: string
  description?: string | null
  emoji?: string | null
  image?: string | null
}

export function ogImages(): Plugin {
  let root = process.cwd()
  /** Kept alive across requests in dev, and torn down after the build writes its assets. */
  let runner: ViteDevServer | undefined

  return {
    name: "og-images",

    configResolved(config) {
      root = config.root
    },

    // Emitted as assets rather than written by hand, so they land in the client output wherever
    // that is configured to be.
    async generateBundle() {
      if (this.environment.name !== "client") return

      const started = Date.now()
      runner ??= await createRunner(root)
      const { targets, render } = await load(runner, { includeDevOnly: false })

      try {
        const cards = await Promise.all(
          targets.map(async target => ({ fileName: fileNameFor(target.path), source: await render(target) }))
        )
        for (const card of cards) {
          this.emitFile({ type: "asset", ...card })
        }
        logger.info(`🖼️  Rendered ${cards.length} OG images in ${Date.now() - started}ms`, { timestamp: true })
      } finally {
        await runner.close()
        runner = undefined
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0]
        if (!url?.startsWith("/og/") || !url.endsWith(".png")) return next()

        try {
          runner ??= await createRunner(root)
          // Both the module graph and the target list are rebuilt per request, so a renamed post or
          // a new page needs no restart.
          runner.moduleGraph.invalidateAll()

          const { targets, render } = await loadWithRetry(runner, { includeDevOnly: true })
          const target = targets.find(candidate => `/${fileNameFor(candidate.path)}` === url)

          if (!target) {
            res.writeHead(404).end(`No OG target for ${url}`)
            return
          }

          // Never cached: the point of rendering here is that the next request sees the edit.
          res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "no-store" }).end(await render(target))
        } catch (error) {
          logger.error(`Failed to render ${url}: ${String(error)}`, { timestamp: true })
          res.writeHead(500).end("OG render failed")
        }
      })

      server.httpServer?.on("close", () => {
        void runner?.close()
        runner = undefined
      })
    }
  }
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

function fileNameFor(routePath: string) {
  const normalized = routePath === "/" ? "/index" : routePath.replace(/\/$/, "")
  return `og${normalized}.png`
}

/**
 * A Node module runner, deliberately not the app's own: its ssr environment is workerd, where
 * `node:fs` is a stub and takumi resolves to its wasm backend. `configFile: false` keeps this one
 * free of the app's plugins, so it cannot recurse back into here.
 */
function createRunner(root: string) {
  return createServer({
    configFile: false,
    root,
    logLevel: "error",
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true },
    resolve: {
      alias: {
        "@": path.join(root, "src"),
        "content-collections": path.join(root, ".content-collections/generated")
      }
    }
  })
}

type SeoModule = {
  DEFAULT_SEO: { title: string; description: string; emoji?: string }
}

type ThoughtsModule = {
  getThoughts: () => Array<{ id: string }>
  getThoughtExcerpt: (thought: { id: string }, maxLength?: number) => string
}

type CollectionsModule = {
  allPosts: Array<{ slug: string; title: string; description?: string; image?: string }>
}

type OgModule = {
  generateOGImage: (opts: Omit<OgTarget, "path">) => Promise<Uint8Array>
}

/**
 * The generated collection is rewritten in place whenever content changes, so a request that lands
 * mid-write reads a torn file. One retry clears it.
 */
async function loadWithRetry(runner: ViteDevServer, options: { includeDevOnly: boolean }) {
  try {
    return await load(runner, options)
  } catch {
    await new Promise(resolve => setTimeout(resolve, 200))
    runner.moduleGraph.invalidateAll()
    return load(runner, options)
  }
}

async function load(runner: ViteDevServer, { includeDevOnly }: { includeDevOnly: boolean }) {
  const [og, seo, thoughts, collections] = (await Promise.all([
    runner.ssrLoadModule("/src/utils/seo/og.tsx"),
    runner.ssrLoadModule("/src/utils/seo/index.ts"),
    runner.ssrLoadModule("/src/routes/_main/thoughts/-data/thoughts.ts"),
    runner.ssrLoadModule("content-collections")
  ])) as [OgModule, SeoModule, ThoughtsModule, CollectionsModule]

  const pages = collectPages(runner.config.root, seo.DEFAULT_SEO)

  const posts: Array<OgTarget> = collections.allPosts
    .filter(post => includeDevOnly || !DEV_ONLY_SLUGS.includes(post.slug))
    .map(post => ({
      path: `/blog/${post.slug}`,
      title: post.title,
      description: post.description ?? POST_FALLBACK_DESCRIPTION,
      emoji: POST_EMOJI,
      image: post.image
    }))

  const notes: Array<OgTarget> = thoughts.getThoughts().map(thought => ({
    path: `/thoughts/${thought.id}`,
    title: thoughts.getThoughtExcerpt(thought),
    description: thoughts.getThoughtExcerpt(thought, 160),
    emoji: THOUGHT_EMOJI
  }))

  return {
    targets: [...pages, ...posts, ...notes],
    render: ({ path: _path, ...card }: OgTarget) => og.generateOGImage(card)
  }
}

/**
 * Every static page, taken from the route tree rather than from a list kept beside it. A route that
 * declares no `seo` still gets a card, which is the point: a page cannot ship without one.
 *
 * Parameterised paths are skipped, because the values behind them come from content: those targets
 * are collected from the collections instead.
 */
function collectPages(root: string, fallback: SeoModule["DEFAULT_SEO"]): Array<OgTarget> {
  return collectRouteCards(root)
    .filter(card => !card.path.includes("$") && !card.path.startsWith("/api/"))
    .map(card => ({ path: card.path, ...(card.seo ?? fallback) }))
}
