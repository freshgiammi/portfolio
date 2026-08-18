import { faker } from "@faker-js/faker"

/**
 * Shared faker instance for story fixtures. Unseeded on purpose: stories should look different
 * every load, so stale hard-coded expectations never sneak into demos.
 */
export { faker }

/**
 * Random cat photo from cataas.com. Storybook runs in the browser with network access, so remote
 * images exercise the real loading path (lazy load, decode, aspect ratio) instead of freezing one
 * local asset into every demo. Plain `/cat` serves a different image per request, which is what
 * makes every story mount fresh.
 */
export function catImage(width = 800, height = 600) {
  return `https://cataas.com/cat?width=${width}&height=${height}`
}
