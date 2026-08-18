import type { MDXContent } from "mdx/types"

/** One lazy-loaded chunk per post, keyed by slug, so a visitor only downloads the post they're reading. */
const postMdxModules = import.meta.glob<{ default: MDXContent }>("/src/content/posts/*.mdx")

/**
 * Cached per slug, so the promise the route's `loader` awaits and the one `getSettledPostMdx` reads
 * back are the same object. A promise always settles asynchronously, even for an already-loaded
 * module, so calling the glob entry a second time would hand the caller a fresh, still-pending
 * promise and suspend all over again — the whole point of preloading.
 */
const preloaded = new Map<string, Promise<{ default: MDXContent }>>()

/**
 * The same modules, once settled. The route's `loader` always awaits `preloadPostMdx` before a
 * navigation completes, so by the time the template renders, a lookup here is guaranteed to hit —
 * reading it synchronously, rather than through `use()`, skips the one unconditional suspend-and-
 * retry `use()` forces even on an already-resolved promise, which was enough to paint the route's
 * `<Suspense>` fallback for a frame despite the data being ready the entire time.
 */
const settled = new Map<string, { default: MDXContent }>()

/** Caps how many posts' compiled MDX stay in memory for one visit, same trade as `particles`' cache. */
const POSTS_REMEMBERED = 20

/**
 * Starts (or reuses) the post's MDX import. The route's `loader` awaits this before a navigation
 * completes — awaited there rather than passed through as loader data, since a compiled MDX
 * component can't survive serialization to the client. Not route-private since the client entry also
 * calls this, to start a hydrating page's own chunk before hydration itself begins — see the comment
 * in `client.tsx`.
 */
export function preloadPostMdx(slug: string) {
  let promise = preloaded.get(slug)
  if (!promise) {
    promise = postMdxModules[`/src/content/posts/${slug}.mdx`]!()
    void promise.then(module => settled.set(slug, module))
    preloaded.set(slug, promise)
    if (preloaded.size > POSTS_REMEMBERED) preloaded.delete(preloaded.keys().next().value!)
  }
  return promise
}

/** The already-settled module for a post whose `preloadPostMdx` promise the caller knows has
    resolved — see `settled`'s own comment for why this exists alongside the promise-returning
    `preloadPostMdx` instead of replacing it. */
export function getSettledPostMdx(slug: string) {
  return settled.get(slug)
}
