const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

/**
 * Counts are formatted with standard grouping under 10k (e.g. `1,234`),
 * and abbreviated using compact notation past four digits (`12.3K`).
 */
export function formatCount(value: number): string {
  return value < 10_000 ? value.toLocaleString("en") : compact.format(value)
}
