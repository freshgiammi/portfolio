import { createServerFn } from "@tanstack/react-start"
import { allPosts, allThoughts } from "content-collections"

/**
 * A server function rather than a plain import: `allPosts`/`allThoughts` carry every post and
 * thought's full body, and the contributions calendar only ever needs a title, a date, and a kind.
 * The handler is extracted at build time, so the collections never reach the client bundle.
 */

export type MilestoneKind = "post" | "thought" | "release"

export type Milestone = {
  /** `YYYY-MM-DD`, the same key GitHub writes on its calendar cells. */
  date: string
  label: string
  kind: MilestoneKind
}

/**
 * Days worth marking on the contribution calendar that left no file behind: a deploy, a launch, a
 * talk. Posts and thoughts are deliberately absent — they are read off their own frontmatter below,
 * so a published date cannot drift out of step with the day the calendar marks.
 */
const MILESTONES: Array<Milestone> = [
  // { date: "2026-05-04", label: "Portfolio v3 shipped", kind: "release" }
]

/** Frontmatter may carry a time; the calendar is keyed by date alone. */
function toDay(published: string) {
  return published.slice(0, 10)
}

export const getMilestonesByDate = createServerFn({ method: "GET" }).handler((): Record<string, Array<Milestone>> => {
  const all: Array<Milestone> = [
    ...MILESTONES,
    ...allPosts.map(post => ({ date: toDay(post.published), label: post.title, kind: "post" as const })),
    ...allThoughts.map(thought => ({
      date: toDay(thought.published),
      label: thought.title,
      kind: "thought" as const
    }))
  ]

  const byDate: Record<string, Array<Milestone>> = {}
  for (const milestone of all) {
    const existing = byDate[milestone.date]
    if (existing) existing.push(milestone)
    else byDate[milestone.date] = [milestone]
  }

  return byDate
})
