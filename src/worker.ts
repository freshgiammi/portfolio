import startEntry from "@tanstack/react-start/server-entry"

/**
 * The worker itself, rather than TanStack Start's entry directly: `main` in `wrangler.jsonc` has to
 * name a file, and this is the file that names the entry.
 */
export default {
  // Start types its handler as `(request, opts?)` while the runtime calls it with `(request, env,
  // ctx)`. Passed straight through all the same, which is what Start's own entry does with it.
  fetch: startEntry.fetch as ExportedHandlerFetchHandler<Env>
} satisfies ExportedHandler<Env>
