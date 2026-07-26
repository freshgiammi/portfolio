export type Thought = {
  /** Doubles as the URL segment, so keep it kebab-case and stable once published. */
  id: string
  /** ISO date, so it sorts and formats the same way posts do. */
  published: string
  body: string
  tags: Array<string>
}

const THOUGHTS: Array<Thought> = []

/** Newest first, the order the feed reads in and the one the neighbour links follow. */
export function getThoughts() {
  return [...THOUGHTS].sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
}

/**
 * A thought has no title, so the first sentence stands in for one wherever a title is required:
 * the browser tab, the OG card, a neighbour link.
 */
export function getThoughtExcerpt(thought: Thought, maxLength = 70) {
  const [firstParagraph = ""] = thought.body.split("\n\n")
  const firstSentence = firstParagraph.split(/(?<=[.!?])\s/)[0] ?? firstParagraph
  const excerpt = firstSentence.trim()

  if (excerpt.length <= maxLength) return excerpt
  return `${excerpt.slice(0, maxLength).trimEnd()}…`
}
