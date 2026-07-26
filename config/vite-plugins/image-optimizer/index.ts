import type { Plugin, ResolvedConfig } from "vite"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"

/**
 * `ViteImageOptimizer`, scoped to the client build and with the `publicDir` half repaired.
 *
 * Two things go wrong once there is more than one build environment, and both come from the plugin
 * keeping a single resolved config in a closure.
 *
 * Bundled assets are rewritten in `generateBundle`, straight on the bundle map, so those always work.
 * Public files are copied rather than emitted, so the plugin re-reads them from
 * `<root>/<build.outDir>` in `closeBundle`. But `configResolved` fires once per environment, the
 * server one arrives last, and its `outDir` is the one directory `public/` is never copied into:
 * `existsSync` says no, and every file is skipped without a word. Dropping the server environment's
 * config leaves the client's in place.
 *
 * That alone leaves the plugin running its public pass twice, once per environment, re-encoding
 * output it optimised moments earlier and printing the stats table again. The server bundle has no
 * images in it at all, so the whole plugin belongs to the client environment.
 */
export function imageOptimizer(...args: Parameters<typeof ViteImageOptimizer>): Plugin {
  // oxlint-disable-next-line new-cap -- the package exports it capitalised
  const plugin: Plugin = ViteImageOptimizer(...args)
  const inner = plugin.configResolved

  return {
    ...plugin,
    applyToEnvironment: environment => environment.name === "client",
    ...(typeof inner === "function" && {
      configResolved(config: ResolvedConfig) {
        if (config.build.ssr) return
        return inner.call(this, config)
      }
    })
  }
}
