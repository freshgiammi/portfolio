/*
 * Storybook stand-in for `cloudflare:workers`, which only exists under the app's own Vite
 * pipeline.
 *
 * The tanstack-react framework keeps real createServerFn handlers as the default implementation
 * of their mocks, so a story that forgets to override a server function executes the real handler
 * here. Every binding therefore answers with empty results instead of throwing: count queries
 * degrade to zero through the callers' own `?? 0` guards, and stories seed real data via
 * `mocked(...)` overrides in their `beforeEach`.
 */

const emptyStatement = {
  bind: () => emptyStatement,
  all: () => Promise.resolve({ results: [] }),
  raw: () => Promise.resolve([]),
  first: () => Promise.resolve(null),
  run: () => Promise.resolve({ success: true, results: [], meta: {} })
}

const database = {
  ...emptyStatement,
  batch: () => Promise.resolve([]),
  exec: () => Promise.resolve([])
}

// Any other binding answers the same way, so new server code needs no stub updates.
const bindings: Record<string, typeof database> = { freshgiammi_reads: database, TWEETS_KV: database }

export const env = new Proxy(bindings, {
  get: (target, key) => target[String(key)] ?? database
})
