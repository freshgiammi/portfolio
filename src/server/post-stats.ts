import { createServerFn } from "@tanstack/react-start"
import { env } from "cloudflare:workers"
import { allPosts } from "content-collections"
import * as v from "valibot"

/**
 * The counts under a post, as server functions rather than fetch calls against `/api` routes: the
 * input schema is the request contract, the handler's return type is the response type, and the
 * caller gets both without a URL, a method, or a hand-written check of the parsed json.
 *
 * Everything below the schemas runs only on the server. The bindings and the post collection are
 * imported at the top all the same — the handlers are extracted at build time, so none of it
 * reaches the client bundle.
 */

export type PostStats = { reads: number; likes: number; liked: boolean; claps: number; myClaps: number }

/** How many claps one voter can spend on one post. Enforced here, not only in the button. */
export const CLAP_CAP = 10

/** The opaque id a browser generates for itself; see `utils/voter`. */
const voterSchema = v.pipe(v.string(), v.regex(/^[A-Za-z0-9_-]{8,64}$/))

/** Keeps the tables to real posts: the slug arrives from the client and is the primary key. */
const slugSchema = v.pipe(
  v.string(),
  v.check(slug => allPosts.some(post => post.slug === slug), "Unknown post")
)

export const getPostStats = createServerFn({ method: "GET" })
  .validator(v.object({ slug: slugSchema, voter: v.optional(voterSchema) }))
  .handler(async ({ data }): Promise<PostStats> => {
    const [reads, likes, liked, claps, myClaps] = await env.freshgiammi_reads.batch<{ value: number }>([
      env.freshgiammi_reads.prepare("SELECT count AS value FROM reads WHERE slug = ?1").bind(data.slug),
      env.freshgiammi_reads.prepare("SELECT COUNT(*) AS value FROM post_likes WHERE slug = ?1").bind(data.slug),
      // A voterless call still gets the counts; it just never comes back as already liked or clapped.
      env.freshgiammi_reads
        .prepare("SELECT COUNT(*) AS value FROM post_likes WHERE slug = ?1 AND voter = ?2")
        .bind(data.slug, data.voter ?? ""),
      env.freshgiammi_reads
        .prepare("SELECT COALESCE(SUM(count), 0) AS value FROM post_claps WHERE slug = ?1")
        .bind(data.slug),
      env.freshgiammi_reads
        .prepare("SELECT count AS value FROM post_claps WHERE slug = ?1 AND voter = ?2")
        .bind(data.slug, data.voter ?? "")
    ])

    return {
      reads: reads?.results[0]?.value ?? 0,
      likes: likes?.results[0]?.value ?? 0,
      liked: (liked?.results[0]?.value ?? 0) > 0,
      claps: claps?.results[0]?.value ?? 0,
      myClaps: myClaps?.results[0]?.value ?? 0
    }
  })

export const recordPostRead = createServerFn({ method: "POST" })
  .validator(v.object({ slug: slugSchema }))
  .handler(async ({ data }): Promise<number> => {
    // One statement, so two readers finishing at the same moment cannot both write the same value,
    // and the new count comes back without a second round trip.
    const row = await env.freshgiammi_reads
      .prepare(
        `INSERT INTO reads (slug, count) VALUES (?1, 1)
         ON CONFLICT (slug) DO UPDATE SET count = count + 1, updated_at = datetime('now')
         RETURNING count`
      )
      .bind(data.slug)
      .first<{ count: number }>()

    return row?.count ?? 0
  })

export const setPostLike = createServerFn({ method: "POST" })
  .validator(v.object({ slug: slugSchema, voter: voterSchema, liked: v.boolean() }))
  .handler(async ({ data }): Promise<Pick<PostStats, "likes" | "liked">> => {
    if (data.liked) {
      // Idempotent by primary key, so a double click or a retried call cannot like twice.
      await env.freshgiammi_reads
        .prepare("INSERT OR IGNORE INTO post_likes (slug, voter) VALUES (?1, ?2)")
        .bind(data.slug, data.voter)
        .run()
    } else {
      await env.freshgiammi_reads
        .prepare("DELETE FROM post_likes WHERE slug = ?1 AND voter = ?2")
        .bind(data.slug, data.voter)
        .run()
    }

    const row = await env.freshgiammi_reads
      .prepare("SELECT COUNT(*) AS likes FROM post_likes WHERE slug = ?1")
      .bind(data.slug)
      .first<{ likes: number }>()

    return { likes: row?.likes ?? 0, liked: data.liked }
  })

export const addPostClaps = createServerFn({ method: "POST" })
  .validator(
    v.object({
      slug: slugSchema,
      voter: voterSchema,
      // Taps are coalesced on the client, so one call carries several claps at once.
      claps: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(CLAP_CAP))
    })
  )
  .handler(async ({ data }): Promise<Pick<PostStats, "claps" | "myClaps">> => {
    // Batched so the total is read inside the same transaction as the write it has to reflect, and
    // `MIN` applies the cap in the statement rather than after a read that another tab could race.
    const [mine, total] = await env.freshgiammi_reads.batch<{ value: number }>([
      env.freshgiammi_reads
        .prepare(
          `INSERT INTO post_claps (slug, voter, count) VALUES (?1, ?2, MIN(?3, ?4))
           ON CONFLICT (slug, voter) DO UPDATE SET count = MIN(?4, count + ?3), updated_at = datetime('now')
           RETURNING count AS value`
        )
        .bind(data.slug, data.voter, data.claps, CLAP_CAP),
      env.freshgiammi_reads
        .prepare("SELECT COALESCE(SUM(count), 0) AS value FROM post_claps WHERE slug = ?1")
        .bind(data.slug)
    ])

    return { claps: total?.results[0]?.value ?? 0, myClaps: mine?.results[0]?.value ?? 0 }
  })
