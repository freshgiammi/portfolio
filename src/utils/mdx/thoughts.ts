import type { MDXContent } from "mdx/types"

/** One lazy-loaded chunk per thought — see `preloadPostMdx`'s comment, its counterpart for posts. */
const thoughtMdxModules = import.meta.glob<{ default: MDXContent }>("/src/content/thoughts/*.mdx")

/** Cached per slug for the same reason `preloadPostMdx` (blog's equivalent) caches it. */
const preloaded = new Map<string, Promise<{ default: MDXContent }>>()

/**
 * The same modules, once settled. The route's `loader` always awaits `preloadThoughtMdx` before a
 * navigation completes, so by the time the template renders, a lookup here is guaranteed to hit —
 * reading it synchronously, rather than through `use()`, skips the one unconditional suspend-and-
 * retry `use()` forces even on an already-resolved promise, which was enough to paint the route's
 * `<Suspense>` fallback for a frame despite the data being ready the entire time.
 */
const settled = new Map<string, { default: MDXContent }>()

/** Caps how many thoughts' compiled MDX stay in memory for one visit, same cap as posts. */
const THOUGHTS_REMEMBERED = 20

/**
 * Started by the route's `loader`; see `preloadPostMdx` (blog's equivalent) for why. Not route-private
 * since the client entry also calls this, to start a hydrating page's own chunk before hydration
 * itself begins — see the comment in `client.tsx`.
 */
export function preloadThoughtMdx(slug: string) {
  let promise = preloaded.get(slug)
  if (!promise) {
    promise = thoughtMdxModules[`/src/content/thoughts/${slug}.mdx`]!()
    void promise.then(module => settled.set(slug, module))
    preloaded.set(slug, promise)
    if (preloaded.size > THOUGHTS_REMEMBERED) preloaded.delete(preloaded.keys().next().value!)
  }
  return promise
}

/** The already-settled module for a thought whose `preloadThoughtMdx` promise the caller knows has
    resolved — see `settled`'s own comment for why this exists alongside the promise-returning
    `preloadThoughtMdx` instead of replacing it. */
export function getSettledThoughtMdx(slug: string) {
  return settled.get(slug)
}
