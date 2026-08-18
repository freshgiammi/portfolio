import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"

import { createLogger, type Plugin, type ViteDevServer } from "vite"

import { extractOgImage } from "./og-image.ts"

/**
 * Resolves every linked page's OG-image preview at build/dev-start time and exposes them as a
 * virtual module, so nothing about a preview is fetched by the worker at request time.
 *
 * Urls are found by scanning `src` for `previewUrl(...)` calls rather than by file or field-name
 * convention, and answers are cached under `node_modules/.cache` so only new or stale entries touch
 * the network.
 */

const logger = createLogger("info", { prefix: "[link-previews]" })

const MODULE_ID = "virtual:link-images"

const SOURCE_DIR = "src"

const SOURCE_EXTENSIONS = [".ts", ".tsx"]

const CACHE_FILE = "node_modules/.cache/link-images.json"

/** How long a resolved preview is trusted. A site's OG image is branding; it changes about as often. */
const FRESH_MS = 30 * 24 * 60 * 60 * 1000

/** Shorter for a page that answered with nothing, so a site that adds one is picked up next week. */
const MISS_FRESH_MS = 7 * 24 * 60 * 60 * 1000

type Result = { image: string | null; checkedAt: string }

type Results = Record<string, Result>

export function linkPreviews(options: { sourceDir?: string; cacheFile?: string } = {}): Plugin {
  let root = process.cwd()
  let sourceDir = ""
  let cachePath = ""
  let results: Results = {}
  let resolving: Promise<void> | undefined

  return {
    name: "link-previews",

    configResolved(config) {
      root = config.root
      sourceDir = options.sourceDir ?? path.join(root, SOURCE_DIR)
      cachePath = options.cacheFile ?? path.join(root, CACHE_FILE)
    },

    /** Vite calls this once per environment; the shared promise avoids resolving twice for the same build. */
    async buildStart() {
      resolving ??= resolve(sourceDir, cachePath).then(resolved => {
        results = resolved
      })
      await resolving
    },

    /** Watches every file under the source dir rather than a fixed list; cheap since `resolve` only hits the network for new or stale urls. */
    configureServer(server) {
      server.watcher.on("change", changed => {
        const normalized = path.normalize(changed)
        if (!normalized.startsWith(sourceDir + path.sep)) return
        if (!SOURCE_EXTENSIONS.includes(path.extname(normalized))) return

        resolving = resolve(sourceDir, cachePath).then(resolved => {
          results = resolved
          invalidate(server)
        })
      })
    },

    resolveId(id) {
      return id === MODULE_ID ? `\0${MODULE_ID}` : null
    },

    load(id) {
      if (id !== `\0${MODULE_ID}`) return null

      // Only the urls that resolved: an entry with no preview is one the app never has to ask about.
      const images = Object.fromEntries(
        Object.entries(results).flatMap(([url, result]) => (result.image ? [[url, result.image]] : []))
      )

      return `export default ${JSON.stringify(images)}`
    }
  }
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

async function resolve(sourceDir: string, cachePath: string): Promise<Results> {
  const urls = await readUrls(sourceDir)
  if (urls.length === 0) return {}

  const cached = await readCache(cachePath)

  const now = Date.now()
  const stale = urls.filter(url => {
    const previous = cached[url]
    if (!previous) return true

    const age = now - Date.parse(previous.checkedAt)
    return age > (previous.image ? FRESH_MS : MISS_FRESH_MS)
  })

  // A url no longer wrapped in `previewUrl(...)` anywhere should not keep its cache entry alive forever.
  const dropped = Object.keys(cached).filter(url => !urls.includes(url)).length
  if (stale.length === 0 && dropped === 0) return cached

  const attempted = new Map(await Promise.all(stale.map(async url => [url, await extractOgImage(url)] as const)))
  const checkedAt = new Date().toISOString()

  const results: Results = {}
  for (const url of urls) {
    const previous = cached[url]

    if (!attempted.has(url)) {
      if (previous) results[url] = previous
      continue
    }

    // A no-image answer and an unreachable site look identical here, so a prior preview is kept rather than dropped for one bad build.
    results[url] = { image: attempted.get(url) ?? previous?.image ?? null, checkedAt }
  }

  await writeCache(cachePath, results)

  const found = [...attempted.values()].filter(Boolean).length
  logger.info(`🔎 Read ${stale.length} ${stale.length === 1 ? "page" : "pages"} for previews`, { timestamp: true })
  if (found < stale.length) {
    logger.warn(`   ${stale.length - found} declared no og:image, or could not be reached`, { timestamp: true })
  }

  return results
}

/** Every `previewUrl("...")` call under `sourceDir`, read from raw source since this runs before the app's module graph exists. */
async function readUrls(sourceDir: string): Promise<Array<string>> {
  const urls = new Set<string>()

  let files: Array<string>
  try {
    files = await walk(sourceDir)
  } catch (error) {
    logger.error(`Could not read source dir: ${String(error)}`, { timestamp: true })
    return []
  }

  await Promise.all(
    files.map(async file => {
      const source = await readFile(file, "utf8")
      for (const match of source.matchAll(/\bpreviewUrl\(\s*"([^"]+)"\s*\)/g)) urls.add(match[1]!)
    })
  )

  return [...urls]
}

/** Every file under `dir` (recursively) whose extension is one `previewUrl(...)` could appear in. */
async function walk(dir: string): Promise<Array<string>> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true })

  return entries
    .filter(entry => entry.isFile() && SOURCE_EXTENSIONS.includes(path.extname(entry.name)))
    .map(entry => path.join(entry.parentPath, entry.name))
}

async function readCache(cachePath: string): Promise<Results> {
  try {
    return JSON.parse(await readFile(cachePath, "utf8")) as Results
  } catch {
    return {}
  }
}

async function writeCache(cachePath: string, results: Results): Promise<void> {
  await mkdir(path.dirname(cachePath), { recursive: true })
  await writeFile(cachePath, JSON.stringify(results, null, 2))
}

/** Dropped from every environment, not just the client, or SSR would keep serving stale answers. */
function invalidate(server: ViteDevServer) {
  for (const environment of Object.values(server.environments)) {
    const module = environment.moduleGraph.getModuleById(`\0${MODULE_ID}`)
    if (module) environment.moduleGraph.invalidateModule(module)
  }

  server.ws.send({ type: "full-reload" })
}
