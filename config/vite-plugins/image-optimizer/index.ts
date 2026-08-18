import fs from "node:fs/promises"
import path from "node:path"

import sharp from "sharp"
import { createLogger, type Plugin, type ResolvedConfig } from "vite"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"

/**
 * `ViteImageOptimizer`, scoped to the client build, with EXIF orientation applied before it runs.
 *
 * The plugin keeps a single resolved config across environments, and the server's `outDir`
 * overwrites the client's; since public files are only ever copied into the client output, that
 * makes its `closeBundle` pass silently skip them, then re-run redundantly for the server
 * environment. Scoping the whole plugin to `client` fixes both.
 */

const logger = createLogger("info", { prefix: "[images]" })

/** Anything above 1 means the pixels are stored one way and meant to be shown another. */
const UPRIGHT = 1

const JPEG_EXTENSIONS = new Set([".jpg", ".jpeg"])

/** High enough that this intermediate encode is not the one that costs quality: the plugin follows. */
const ROTATED_QUALITY = 95

export function imageOptimizer(...args: Parameters<typeof ViteImageOptimizer>): Plugin {
  // oxlint-disable-next-line new-cap -- the package exports it capitalised
  const plugin: Plugin = ViteImageOptimizer(...args)
  const innerConfigResolved = plugin.configResolved
  const innerCloseBundle = plugin.closeBundle

  let outDir: string | undefined

  return {
    ...plugin,
    applyToEnvironment: environment => environment.name === "client",

    configResolved(config: ResolvedConfig) {
      if (config.build.ssr) return undefined

      outDir = path.resolve(config.root, config.build.outDir)
      return typeof innerConfigResolved === "function" ? innerConfigResolved.call(this, config) : undefined
    },

    /**
     * Phones store photos sideways with an EXIF orientation tag; sharp drops that tag and won't
     * rotate unless told to, so rotate explicitly before the optimiser strips metadata.
     */
    async closeBundle(error?: Error) {
      if (outDir) await applyOrientation(outDir)
      if (typeof innerCloseBundle === "function") await innerCloseBundle.call(this, error)
    }
  }
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

async function applyOrientation(directory: string) {
  const files = await findJpegs(directory)
  const results = await Promise.all(files.map(file => uprightIfNeeded(file, directory)))
  const rotated = results.filter(name => name !== null)

  if (rotated.length > 0) {
    logger.info(`🔄 Applied EXIF orientation to ${rotated.join(", ")}`, { timestamp: true })
  }
}

/** Returns the file's name when it had to be rotated, so the caller can report what changed. */
async function uprightIfNeeded(file: string, directory: string): Promise<string | null> {
  const name = path.relative(directory, file)

  try {
    const image = sharp(file)
    const { orientation } = await image.metadata()
    if (!orientation || orientation === UPRIGHT) return null

    // `rotate()` with no argument means "apply the EXIF orientation", and the metadata that carried it
    // is dropped on write, so the result cannot be rotated twice by anything downstream.
    const upright = await image.rotate().jpeg({ quality: ROTATED_QUALITY, mozjpeg: true }).toBuffer()
    await fs.writeFile(file, upright)
    return name
  } catch (error) {
    logger.warn(`Could not apply orientation to ${name}: ${String(error)}`, { timestamp: true })
    return null
  }
}

async function findJpegs(directory: string): Promise<Array<string>> {
  const entries = await fs.readdir(directory, { withFileTypes: true })

  const found = await Promise.all(
    entries.map(async entry => {
      const full = path.join(directory, entry.name)
      if (entry.isDirectory()) return findJpegs(full)
      return JPEG_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [full] : []
    })
  )

  return found.flat()
}
