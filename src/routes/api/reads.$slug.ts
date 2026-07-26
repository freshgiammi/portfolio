import { createFileRoute } from "@tanstack/react-router"
import { env } from "cloudflare:workers"
import { allPosts } from "content-collections"

export const Route = createFileRoute("/api/reads/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!isKnownSlug(params.slug)) return new Response("Not found", { status: 404 })

        const row = await env.freshgiammi_reads.prepare("SELECT count FROM reads WHERE slug = ?1")
          .bind(params.slug)
          .first<{ count: number }>()

        return Response.json({ slug: params.slug, count: row?.count ?? 0 })
      },
      POST: async ({ params }) => {
        if (!isKnownSlug(params.slug)) return new Response("Not found", { status: 404 })

        // One statement, so two readers finishing at the same moment cannot both write the same
        // value, and the new count comes back without a second round trip.
        const row = await env.freshgiammi_reads.prepare(
          `INSERT INTO reads (slug, count) VALUES (?1, 1)
           ON CONFLICT (slug) DO UPDATE SET count = count + 1, updated_at = datetime('now')
           RETURNING count`
        )
          .bind(params.slug)
          .first<{ count: number }>()

        return Response.json({ slug: params.slug, count: row?.count ?? 0 })
      }
    }
  }
})

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

/** Keeps the table to real posts: the slug arrives from the client and is the primary key. */
function isKnownSlug(slug: string) {
  return allPosts.some(post => post.slug === slug)
}
