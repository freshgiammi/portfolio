import { existsSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { pathToFileURL } from "node:url"

import { createLogger, createServer, type Plugin } from "vite"

import type * as Manifest from "@/utils/seo/manifest"
import type { Card } from "@/utils/seo/manifest"
import type * as OgModule from "@/utils/seo/og"

/**
 * Draws every card the site knows about and writes it into the client output, so the CDN answers
 * them and the renderer never reaches the worker.
 *
 * The list comes from the built worker rather than from a second reading of the source: the SSR
 * build emits the route-tree walk as its own `og-manifest` entry alongside the worker, and this
 * plugin imports that file and runs it in-process. Nothing here knows what a route or a post is —
 * only how to turn the answer into files.
 */

const logger = createLogger("info", { prefix: "[og]" })

// The two paths are spelled the same as the type-only imports above on purpose: a moved or renamed
// module fails `pnpm typecheck` there first, and `assertModulesExist` — run at config resolution —
// catches string drift that survives anyway. The entry key doubles as the emitted chunk's filename.
const MANIFEST_ENTRY = "og-manifest"
const MANIFEST_ENTRY_PATH = "/src/utils/seo/manifest.ts"
const RENDERER_PATH = "/src/utils/seo/og.tsx"

export function ogCards(): Plugin {
  return {
    name: "og-cards",
    // Runs after the environment builds no matter where it sorts: an object-form post hook makes
    // Vite build every environment before calling any of these handlers.
    configEnvironment(name) {
      if (name !== "ssr") return null
      // Returned options deep-merge, so the worker's own virtual entry under input survives.
      return { build: { rolldownOptions: { input: { [MANIFEST_ENTRY]: MANIFEST_ENTRY_PATH } } } }
    },
    // Before anything compiles: the paths below are plain strings tsc cannot see through, so their
    // one failure mode — drifting from the type-only imports while those got fixed — dies here.
    configResolved() {
      assertModulesExist()
    },
    buildApp: {
      order: "post",
      async handler(builder) {
        const started = Date.now()
        const outputDir = builder.environments.client!.config.build.outDir

        const cards = await readManifest(builder.environments.ssr!.config.build.outDir)
        await render(cards, outputDir)

        logger.info(`🖼️  Emitted ${cards.length} OG cards in ${Date.now() - started}ms`, { timestamp: true })
      }
    }
  }
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

function assertModulesExist() {
  for (const modulePath of [MANIFEST_ENTRY_PATH, RENDERER_PATH]) {
    if (!existsSync(path.join(process.cwd(), modulePath)))
      throw new Error(`og-cards: ${modulePath} does not exist — update the og-cards constants if the module moved`)
  }
}

async function readManifest(serverDir: string): Promise<Array<Card>> {
  const emitted = path.join(serverDir, `${MANIFEST_ENTRY}.js`)
  let manifest: typeof Manifest
  try {
    manifest = await import(pathToFileURL(emitted).href)
  } catch (error) {
    throw new Error(`Card manifest chunk missing at ${emitted} — did the ssr build emit it?`, { cause: error })
  }
  return manifest.buildManifest()
}

/**
 * ⚠️ Do not replace this runner with a direct import — it looks like it should work and cannot.
 * `generateOGImage`'s fonts and grain tile are `?inline` imports, and `?inline` is a Vite transform,
 * not a file: from this plain-Node process the module fails to resolve before takumi even loads.
 * The runner is deliberately minimal — no plugins, aliases or config beyond a root — because the
 * renderer reaches nothing else in the app.
 */
async function render(cards: Array<Card>, outputDir: string) {
  const runner = await createServer({
    configFile: false,
    root: process.cwd(),
    logLevel: "error",
    resolve: {
      tsconfigPaths: true
    },
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true }
  })

  try {
    const { generateOGImage } = (await runner.ssrLoadModule(RENDERER_PATH)) as typeof OgModule

    await Promise.all(
      cards.map(async ({ file, ...card }) => {
        const target = path.join(outputDir, file)
        await mkdir(path.dirname(target), { recursive: true })
        await writeFile(target, await generateOGImage(card))
      })
    )
  } finally {
    await runner.close()
  }
}
