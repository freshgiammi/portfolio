import { createRequire } from "node:module"
import path from "node:path"

import type { Plugin } from "vite"

/**
 * `html-dom-parser` exposes a DOM-based implementation under the `browser` export condition, and a
 * worker resolves `browser`. That implementation calls `document.implementation.createHTMLDocument`,
 * which does not exist in workerd, so every markdown render throws and the post falls back to client
 * rendering.
 *
 * Pointing the server build at the package's own `lib/index.js` fixes it without touching the
 * condition list every other dependency resolves through, and leaves the browser build on the DOM
 * implementation where it is the faster choice.
 *
 * `lib/index.js` specifically, and not `lib/server/html-to-dom.js`: only the former marks itself as a
 * module, and `html-react-parser` arrives here as CommonJS and reads `.default` off it through
 * `__importDefault`, which double-wraps anything without `__esModule`. An absolute path also stops
 * the `browser` field redirecting it straight back to the DOM implementation.
 *
 * It takes two hooks, because two resolvers are involved: Rollup's for the build, and esbuild's dep
 * optimiser for dev, which prebundles `html-react-parser` before any plugin sees it.
 */

const SPECIFIER = "html-dom-parser"

export function serverDomParser(): Plugin {
  return {
    name: "server-dom-parser",
    enforce: "pre",

    /**
     * Dev needs an alias rather than the hook below, because the dep optimiser prebundles
     * `html-react-parser` with esbuild before any plugin sees the import. Aliases are shared across
     * environments, so this also swaps the parser the browser gets, which costs 32kB gzip of
     * htmlparser2 in a chunk that is never shipped: dev only, deliberately.
     */
    config(_config, env) {
      if (env.command !== "serve") return null
      return { resolve: { alias: { [SPECIFIER]: locateServerEntry() } } }
    },

    applyToEnvironment: environment => environment.name === "ssr",

    async resolveId(id, importer, options) {
      if (id !== SPECIFIER) return null

      // Located through the importer rather than from the project root: it is a transitive
      // dependency, so under pnpm only `html-react-parser` itself can see it.
      const manifest = await this.resolve(`${SPECIFIER}/package.json`, importer, { ...options, skipSelf: true })
      if (!manifest) return null

      return path.join(path.dirname(manifest.id), "lib/index.js")
    }
  }
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

/**
 * Resolved through `html-react-parser`, since under pnpm the project root cannot see a transitive
 * dependency. Its own entry file stands in for its manifest, which it does not export.
 */
function locateServerEntry() {
  const fromParser = createRequire(createRequire(import.meta.url).resolve("html-react-parser"))
  return path.join(path.dirname(fromParser.resolve(`${SPECIFIER}/package.json`)), "lib/index.js")
}
