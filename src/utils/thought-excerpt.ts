/** Enough of a thought to derive a summary string from. */
type ExcerptSource = { excerpt: string }

/**
 * The first sentence of a thought's body, for the places that need a summary rather than the whole
 * note: the meta description and the OG card.
 */
export function getThoughtExcerpt(thought: ExcerptSource, maxLength = 70): string {
  // The stored excerpt is already flattened to one line, so the first sentence is the first split.
  const firstSentence = thought.excerpt.split(/(?<=[.!?])\s/)[0] ?? thought.excerpt
  const excerpt = firstSentence.trim()

  if (excerpt.length <= maxLength) return excerpt
  return `${excerpt.slice(0, maxLength).trimEnd()}…`
}
