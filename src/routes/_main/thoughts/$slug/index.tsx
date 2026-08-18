import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router"
import { allThoughts } from "content-collections"

import { preloadThoughtMdx } from "@/utils/mdx/thoughts"
import type { PageSeo } from "@/utils/seo"
import { createSeoMeta } from "@/utils/seo"
import { getThoughtExcerpt } from "@/utils/thought-excerpt"

import { type Thought, type ThoughtLink, ThoughtTemplate, ThoughtTemplatePending } from "./-components/thought-template"

// Only slug/title, not the full thought: a thought's compiled MDX component can't survive serialization to the client, so `ThoughtDetailPage` re-reads the full thought from `allThoughts` instead.
type ThoughtLoaderData = { slug: string; title: string; newer: ThoughtLink; older: ThoughtLink }

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

function getSortedThoughts(): Array<Thought> {
  return (allThoughts as Array<Thought>).sort(
    (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
  )
}

/** The card, and the page's own title and description: one source, so they can't describe the thought differently. */
function thoughtSeo(slug: string | undefined): PageSeo | undefined {
  const thought = getSortedThoughts().find(candidate => candidate.slug === slug)
  if (!thought) return undefined

  return {
    title: `${thought.title} — freshgiammi`,
    description: getThoughtExcerpt(thought, 160),
    emoji: "💭"
  }
}

export const Route = createFileRoute("/_main/thoughts/$slug/")({
  loader: async ({ params }): Promise<ThoughtLoaderData> => {
    const thoughts = getSortedThoughts()
    const index = thoughts.findIndex(thought => thought.slug === params.slug)
    const thought = thoughts[index]
    if (!thought) throw notFound({ routeId: rootRouteId }) as Error

    // See the identical comment on the blog post's loader: awaited so hover's `intent` preload
    // warms the MDX chunk ahead of a click, and a click with no preceding hover still only waits
    // once, here, rather than showing a loading article after already navigating to it.
    await preloadThoughtMdx(params.slug)

    const toLink = (candidate: Thought | undefined): ThoughtLink =>
      candidate ? { slug: candidate.slug, title: candidate.title } : null

    // Newest first, so the neighbour after this one is the older thought.
    return {
      slug: thought.slug,
      title: thought.title,
      newer: toLink(thoughts[index - 1]),
      older: toLink(thoughts[index + 1])
    }
  },
  head: ({ loaderData }) => {
    // loaderData is undefined when the loader threw notFound() above.
    const seo = loaderData && thoughtSeo(loaderData.slug)
    if (!seo) return {}

    return createSeoMeta({ ...seo, path: `/thoughts/${loaderData.slug}`, type: "article" })
  },
  component: ThoughtDetailPage,
  pendingComponent: ThoughtTemplatePending,
  staticData: {
    eagerPreload: params => preloadThoughtMdx(params.slug!),
    seoFor: params => thoughtSeo(params.slug),
    seoPaths: () => getSortedThoughts().map(thought => `/thoughts/${thought.slug}`)
  }
})

function ThoughtDetailPage() {
  const { slug, newer, older } = Route.useLoaderData()
  // The loader already confirmed this slug exists.
  const thought = getSortedThoughts().find(candidate => candidate.slug === slug)!

  return <ThoughtTemplate thought={thought} newer={newer} older={older} />
}
