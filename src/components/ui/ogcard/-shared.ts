export const OG_CARD_WIDTH = 1200
export const OG_CARD_HEIGHT = 630

// The shapes only ever reach the top-right quadrant, so text can run most of the image's width
// without ever colliding with them. (Variants that scatter shapes everywhere centre their text
// into a narrower measure instead.)
export const TEXT_MAX_WIDTH = 920
export const DESCRIPTION_MAX_LENGTH = 140

// feTurbulence noise tiles replacing the deleted grain.png: channels forced to a single value,
// alpha scaled by the slope, tiled by the caller. White noise lifts a dark ground; black noise
// deepens a light one.
function noiseTile(intercept: number, alphaSlope: number): string {
  const channel = (c: string) => `%3CfeFunc${c} type='linear' slope='0' intercept='${intercept}'/%3E`
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E${channel("R")}${channel("G")}${channel("B")}%3CfeFuncA type='linear' slope='${alphaSlope}'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23g)'/%3E%3C/svg%3E")`
}

/** Which grain goes on which ground - dark backgrounds take the white tile, light ones the black. */
export const GRAIN_TILE_DARK = noiseTile(1, 0.08)
export const GRAIN_TILE_LIGHT = noiseTile(0, 0.17)

/** Cuts at a word boundary rather than mid-word, since takumi has no `text-overflow`. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(" ")
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}...`
}

/** What every card style renders, regardless of how differently it does it. */
export type CardStyleProps = {
  title: string
  description?: string | null
  emoji?: string | null
  /** Category shown at the top of the image - "Writing", "Thoughts", "About", etc. */
  section?: string | null
}
