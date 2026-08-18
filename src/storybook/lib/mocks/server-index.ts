import { seed as seedPostStats } from "./server/post-stats"
import { seed as seedTweets } from "./server/tweet"

/**
 * Runs every server mock's default seeding before each story. Adding a new server module means
 * adding a `mocks/server/<name>.ts` file with an exported `seed()` and one line here — one place
 * per domain, no single growing file.
 */
const seeds = [seedPostStats, seedTweets]

export function seedServerMocks() {
  for (const seed of seeds) seed()
}
