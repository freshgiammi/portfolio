import { SCATTER_LAYOUT } from "../-layouts"
import { ShapeLayer } from "../-shapes"

// --color-tide
const ACCENT = "#6e8cab"

/** Craft's backdrop: faint scattered shapes across a paper ground. */
export function CraftBackdrop() {
  // Quieter than the dark cards' shapes: text sits over the field here, so the wash stays
  // faint enough to keep the type in front.
  return <ShapeLayer width={1200} height={630} color={ACCENT} layout={{ ...SCATTER_LAYOUT, maxOpacity: 0.06 }} />
}
