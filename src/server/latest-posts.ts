import { createServerFn } from "@tanstack/react-start"
import { allPosts } from "content-collections"

/**
 * A server function rather than a plain import: `allPosts` carries every post's full body, and this
 * widget only ever needs three titles. The handler is extracted at build time, so the collection
 * never reaches the client bundle.
 */

const LATEST_POSTS_COUNT = 3

export type PostSummary = {
  slug: string
  title: string
  published: string
  readingTime: number
}

export const getLatestPosts = createServerFn({ method: "GET" }).handler((): Array<PostSummary> =>
  (allPosts as Array<PostSummary>)
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
    .slice(0, LATEST_POSTS_COUNT)
)
