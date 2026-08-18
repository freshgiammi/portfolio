import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router"
import { allPosts } from "content-collections"

import { postStatsQueryOptions } from "@/query/options/post-stats"
import { preloadPostMdx } from "@/utils/mdx/posts"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"
import { getServerVoterId } from "@/utils/voter"

import {
  type BlogPost,
  BlogPostTemplate,
  BlogPostTemplatePending,
  type PostLink
} from "./-components/blog-post-template"

// Only slug/title, not the full post: a post's compiled MDX component can't survive serialization to the client, so `PostDetailPage` re-reads the full post from `allPosts` instead.
type PostLoaderData = { slug: string; title: string; newer: PostLink; older: PostLink }

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

function getSortedPosts(): Array<BlogPost> {
  return (allPosts as Array<BlogPost>).sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
}

/** The card, and the page's own title and description: one source, so they can't describe the post differently. */
function postSeo(slug: string | undefined): PageSeo | undefined {
  const post = getSortedPosts().find(candidate => candidate.slug === slug)
  if (!post) return undefined

  return {
    title: `${post.title} — freshgiammi`,
    description: post.description ?? "A post from my blog.",
    emoji: "✍️"
  }
}

export const Route = createFileRoute("/_main/blog/$slug/")({
  loader: async ({ params, context }): Promise<PostLoaderData> => {
    const posts = getSortedPosts()
    const index = posts.findIndex(post => post.slug === params.slug)
    const post = posts[index]
    if (!post) throw notFound({ routeId: rootRouteId }) as Error

    // Awaited, not fired-and-forgotten: hover's `intent` preload already runs this loader ahead of a
    // click, so by the time this resolves the post's MDX chunk is warm and the article renders with
    // nothing left to suspend on. A click with no preceding hover still only waits once, here, rather
    // than showing a loading article after already navigating to it. The stats prefetch rides along
    // the same way, so the reads/likes/claps counts (and this reader's own liked state, via the voter
    // cookie) are in the initial render instead of popping in once `usePostStats`'s own client-side
    // fetch resolves. This route is excluded from prerendering (see `vite.config.ts`) specifically so
    // this runs fresh on every request rather than getting baked into a static file once and frozen.
    await Promise.all([
      preloadPostMdx(params.slug),
      context.queryClient.ensureQueryData(postStatsQueryOptions(params.slug, getServerVoterId()))
    ])

    const toLink = (candidate: BlogPost | undefined): PostLink =>
      candidate ? { slug: candidate.slug, title: candidate.title } : null

    // The list runs newest first, so the neighbour after this one is the older post.
    return { slug: post.slug, title: post.title, newer: toLink(posts[index - 1]), older: toLink(posts[index + 1]) }
  },
  head: ({ loaderData }) => {
    // loaderData is undefined when the loader threw notFound() above.
    const seo = loaderData && postSeo(loaderData.slug)
    if (!seo) return {}

    return createSeoMeta({ ...seo, path: `/blog/${loaderData.slug}`, type: "article" })
  },
  component: PostDetailPage,
  pendingComponent: BlogPostTemplatePending,
  staticData: {
    eagerPreload: params => preloadPostMdx(params.slug!),
    seoFor: params => postSeo(params.slug),
    seoPaths: () => getSortedPosts().map(post => `/blog/${post.slug}`)
  }
})

function PostDetailPage() {
  const { slug, newer, older } = Route.useLoaderData()
  // The loader already confirmed this slug exists.
  const post = getSortedPosts().find(candidate => candidate.slug === slug)!

  return <BlogPostTemplate post={post} newer={newer} older={older} />
}
