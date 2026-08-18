import { BAND_LAYOUT } from "../-layouts"
import { ShapeLayer } from "../-shapes"

// --accent (--color-aurora)
const ACCENT = "#a9844c"

/** The default backdrop: the post corner's mirror image - a shape-band along the bottom edge. */
export function DefaultBackdrop() {
  return <ShapeLayer width={1200} height={630} color={ACCENT} layout={BAND_LAYOUT} />
}
