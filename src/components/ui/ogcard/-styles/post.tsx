import { ShapeLayer } from "../-shapes"

// --accent (--color-aurora)
const ACCENT = "#a9844c"

/** Writing's backdrop: shapes fading into the top-right corner. */
export function PostBackdrop() {
  return <ShapeLayer width={1200} height={630} color={ACCENT} />
}
