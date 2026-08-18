import { createServerFn } from "@tanstack/react-start"
import { env } from "cloudflare:workers"
import type { Tweet } from "react-tweet/api"
import { fetchTweet } from "react-tweet/api"
import * as v from "valibot"

/**
 * The tweet card fetches through here instead of hitting Twitter's syndication API from the
 * browser: that endpoint rate-limits by IP, and every visitor sharing the same egress address
 * would otherwise share the same budget. Routing it through one cached call per tweet, per edge
 * location, keeps a post with an embed readable regardless of how many people load it at once.
 */

const idSchema = v.pipe(v.string(), v.regex(/^\d+$/))

const KEY_PREFIX = "tweet:"

/** A live tweet is immutable enough to sit in cache for a day; a miss is retried much sooner. */
const CACHE_TTL_SECONDS = 86_400
const MISS_TTL_SECONDS = 300

type CachedTweet = { data: Tweet } | { unavailable: true }

export const getCachedTweet = createServerFn({ method: "GET" })
  .validator(v.object({ id: idSchema }))
  .handler(async ({ data: { id } }): Promise<Tweet | null> => {
    const key = `${KEY_PREFIX}${id}`
    const cached = await env.TWEETS_KV.get<CachedTweet>(key, "json")
    if (cached) return "data" in cached ? cached.data : null

    const result = await fetchTweet(id, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; freshgiammi.dev)" }
    })

    // A tombstoned or missing tweet is worth remembering too, just briefly: it stops a deleted
    // or protected embed from re-hitting the syndication API on every load while it stays gone.
    const toCache: CachedTweet = result.data ? { data: result.data } : { unavailable: true }
    await env.TWEETS_KV.put(key, JSON.stringify(toCache), {
      expirationTtl: result.data ? CACHE_TTL_SECONDS : MISS_TTL_SECONDS
    })

    return result.data ?? null
  })
