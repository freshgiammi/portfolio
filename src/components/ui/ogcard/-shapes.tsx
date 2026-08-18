import { CORNER_LAYOUT, type ShapeLayout } from "./-layouts"

/** Every shape is drawn in one canonical orientation, then rotated as a whole via CSS `transform`
    — a Truchet-tile approach, so quarter/semicircle/triangle don't each need per-corner variants. */
type Rotation = 0 | 90 | 180 | 270

type Shape = {
  kind: "circle" | "square" | "pill" | "quarter" | "semicircle" | "line" | "triangle" | "wave"
  x: number
  y: number
  size: number
  height: number
  opacity: number
  rotation: Rotation
}

const ROTATIONS: Array<Rotation> = [0, 90, 180, 270]
function randomRotation(): Rotation {
  return ROTATIONS[Math.floor(Math.random() * 4)]!
}

/** Every shape gets its own opacity within the positional fade, not one flat value throughout. */
function randomize(baseOpacity: number): number {
  return baseOpacity * (0.55 + Math.random() * 0.9)
}

type ShapeKind = Shape["kind"]

const KINDS: Array<ShapeKind> = ["circle", "square", "pill", "quarter", "semicircle", "line", "triangle", "wave"]

/** Walks forward from `candidate` in a fixed cycle until it lands on a kind neither neighbour has,
    so no two adjacent cells ever share a shape kind. */
function resolveKind(candidate: ShapeKind, neighbours: Array<ShapeKind | undefined>): ShapeKind {
  if (!neighbours.includes(candidate)) return candidate
  const start = KINDS.indexOf(candidate)
  for (let i = 1; i <= KINDS.length; i++) {
    const next = KINDS[(start + i) % KINDS.length]!
    if (!neighbours.includes(next)) return next
  }
  return candidate
}

// Roll map: <.24 circle, <.38 square, <.50 pill, <.62 quarter, <.74 semicircle, <.84 line,
// <.93 triangle, else wave. Wide pill (<.10) is decided separately below.
const THRESHOLDS: Array<[number, ShapeKind]> = [
  [0.24, "circle"],
  [0.38, "square"],
  [0.5, "pill"],
  [0.62, "quarter"],
  [0.74, "semicircle"],
  [0.84, "line"],
  [0.93, "triangle"],
  [1, "wave"]
]

// Echoes the site's own `geometric-background` canvas - a loose grid of small shapes - but faded
// by giving each shape its own baked-in opacity rather than a live CSS mask, since the renderer
// here has no DOM to mask against. Three regions: `corner` packs the top-right quadrant (the top
// and right edges are flush with the image's own edges, so only the two inward-facing ones fade
// out), `band` mirrors it along the bottom edge for cards whose text anchors the top, and
// `scatter` covers the whole canvas at a lower opacity. No empty cells either way: the grid is
// fully packed, and it's each shape's own randomized opacity (see `randomize`) that keeps it from
// reading as a flat wash.
function generateShapes(
  width: number,
  height: number,
  { cell: CELL, gap: GAP, maxOpacity: MAX_OPACITY, region }: ShapeLayout
): Array<Shape> {
  const shapes: Array<Shape> = []
  const cols = Math.ceil(width / CELL)
  const rows = Math.ceil(height / CELL)
  // Cells a wide pill has already claimed, so the next column's own roll doesn't draw a second
  // shape on top of it.
  const occupied = new Set<string>()
  const grid = new Map<string, ShapeKind>()

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellKey = `${row}:${col}`
      if (occupied.has(cellKey)) continue

      const cellX = col * CELL
      const cellY = row * CELL
      const centerX = cellX + CELL / 2
      const centerY = cellY + CELL / 2

      let opacity: number
      if (region === "corner") {
        const FADE_START = width * 0.5
        const QUADRANT_BOTTOM = height * 0.5
        if (centerX < FADE_START || centerY > QUADRANT_BOTTOM) continue

        const xFade = Math.min(1, (centerX - FADE_START) / (width - FADE_START))
        const yFade = Math.min(1, (QUADRANT_BOTTOM - centerY) / QUADRANT_BOTTOM)
        opacity = randomize(xFade * yFade * MAX_OPACITY)
      } else if (region === "band") {
        // A strip along the bottom edge, densest at the bottom-right and fading upward and
        // leftward - the mirror of "corner", for cards whose text anchors the top. Multiplying
        // by yFade (not adding to it) guarantees zero at the band's own top edge, so shapes fade
        // in rather than popping in at partial opacity.
        const BAND_TOP = height * 0.64
        if (centerY < BAND_TOP) continue

        const yFade = (centerY - BAND_TOP) / (height - BAND_TOP)
        const xFade = Math.min(1, centerX / (width * 0.55))
        opacity = randomize(yFade * (0.35 + 0.65 * xFade) * MAX_OPACITY)
      } else {
        opacity = randomize(MAX_OPACITY)
      }
      if (opacity < 0.02) continue

      const size = CELL - GAP * 2
      const x = cellX + GAP
      const y = cellY + GAP
      const rotation = randomRotation()

      const left = grid.get(`${row}:${col - 1}`)
      const up = grid.get(`${row - 1}:${col}`)
      const upRight = grid.get(`${row - 1}:${col + 1}`)

      const roll = Math.random()
      const canPlaceWidePill = roll < 0.1 && col < cols - 1 && left !== "pill" && up !== "pill" && upRight !== "pill"

      if (canPlaceWidePill) {
        // Rotating this one would swing its long axis into a neighbouring row it hasn't claimed.
        shapes.push({ kind: "pill", x, y, size: CELL * 2 - GAP * 2, height: size, opacity, rotation: 0 })
        grid.set(cellKey, "pill")
        grid.set(`${row}:${col + 1}`, "pill")
        occupied.add(`${row}:${col + 1}`)
        continue
      }

      const candidate = THRESHOLDS.find(([threshold]) => roll < threshold)![1]
      const kind = resolveKind(candidate, [left, up])
      grid.set(cellKey, kind)
      shapes.push({ kind, x, y, size, height: size, opacity, rotation })
    }
  }

  return shapes
}

export type ShapeLayerProps = { width: number; height: number; color: string; layout?: ShapeLayout }

export function ShapeLayer({ width, height, color, layout = CORNER_LAYOUT }: ShapeLayerProps) {
  return (
    <div style={{ position: "absolute", inset: 0, width, height }}>
      {generateShapes(width, height, layout).map(shape => {
        const key = `${shape.kind}-${shape.x}-${shape.y}`
        const rotate = shape.rotation ? `rotate(${shape.rotation}deg)` : undefined

        if (shape.kind === "quarter") {
          // A quarter-disc, not a rounded corner: the visible piece is one quadrant of a circle
          // twice the cell's size, offset so its centre sits at the wrapper's own top-left corner
          // and the rest is clipped away by `overflow: hidden`. Takumi (like satori) has no
          // `clip-path`, so this is the box-model equivalent of the live canvas's `ctx.arc` wedge.
          // Drawn in one canonical corner only — `rotate` on the wrapper covers the other three.
          return (
            <div
              key={key}
              style={{
                position: "absolute",
                left: shape.x,
                top: shape.y,
                width: shape.size,
                height: shape.height,
                overflow: "hidden",
                transform: rotate
              }}>
              <div
                style={{
                  position: "absolute",
                  left: -shape.size,
                  top: -shape.size,
                  width: shape.size * 2,
                  height: shape.size * 2,
                  borderRadius: "50%",
                  backgroundColor: color,
                  opacity: shape.opacity
                }}
              />
            </div>
          )
        }

        if (shape.kind === "semicircle") {
          // A mirrored pair of half-discs: flat sides on the cell's outer edges, both bulges
          // meeting at the centre. Each column clips a full-cell circle, offset left or right so
          // only the facing half survives — the same offset-and-clip trick as "quarter". The pair
          // lives in one full-cell wrapper so it rotates around the true cell centre.
          const half = shape.size / 2
          return (
            <div
              key={key}
              style={{
                position: "absolute",
                left: shape.x,
                top: shape.y,
                width: shape.size,
                height: shape.height,
                transform: rotate
              }}>
              {[0, 1].map(column => (
                <div
                  key={column}
                  style={{
                    position: "absolute",
                    left: column * half,
                    top: 0,
                    width: half,
                    height: shape.height,
                    overflow: "hidden"
                  }}>
                  <div
                    style={{
                      position: "absolute",
                      left: column === 0 ? -half : 0,
                      top: 0,
                      width: shape.size,
                      height: shape.size,
                      borderRadius: "50%",
                      backgroundColor: color,
                      opacity: shape.opacity
                    }}
                  />
                </div>
              ))}
            </div>
          )
        }

        if (shape.kind === "triangle") {
          // The classic CSS border-triangle: two adjacent sides sized to the box, one transparent
          // and one coloured, produce a right triangle whose right angle sits at their shared
          // corner. Canonical top-left corner only — `rotate` covers the rest.
          return (
            <div
              key={key}
              style={{
                position: "absolute",
                left: shape.x,
                top: shape.y,
                width: 0,
                height: 0,
                borderStyle: "solid",
                borderTopWidth: shape.size,
                borderBottomWidth: 0,
                borderLeftWidth: shape.size,
                borderRightWidth: 0,
                borderTopColor: color,
                borderBottomColor: "transparent",
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                opacity: shape.opacity,
                transform: rotate
              }}
            />
          )
        }

        if (shape.kind === "line") {
          // A stack of evenly-spaced ruled stripes, not one bar — canonical horizontal, wrapped
          // so the whole stack rotates together.
          const stripeCount = 5
          const spacing = shape.height / stripeCount
          const thickness = spacing * 0.45
          return (
            <div
              key={key}
              style={{
                position: "absolute",
                left: shape.x,
                top: shape.y,
                width: shape.size,
                height: shape.height,
                transform: rotate
              }}>
              {Array.from({ length: stripeCount }, (_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: spacing * (i + 0.5) - thickness / 2,
                    width: shape.size,
                    height: thickness,
                    borderRadius: thickness / 2,
                    backgroundColor: color,
                    opacity: shape.opacity
                  }}
                />
              ))}
            </div>
          )
        }

        if (shape.kind === "wave") {
          // No path/stroke support here, unlike the canvas's real zigzag stroke - each segment is
          // its own rotated bar. Same stripe rhythm as "line", but every stripe zigzags instead of
          // running straight.
          const stripeCount = 5
          const segmentCount = 8
          const spacing = shape.height / stripeCount
          const thickness = spacing * 0.45
          const amplitude = spacing * 0.35
          const step = shape.size / segmentCount

          const segments = Array.from({ length: stripeCount }, (_, stripe) => {
            const baseline = spacing * (stripe + 0.5)
            const points = Array.from({ length: segmentCount + 1 }, (__, i) => ({
              x: step * i,
              y: i === 0 ? baseline : baseline + (i % 2 === 0 ? -amplitude : amplitude)
            }))
            return points.slice(1).map((point, i) => {
              const prev = points[i]!
              const dx = point.x - prev.x
              const dy = point.y - prev.y
              const length = Math.hypot(dx, dy)
              const angle = (Math.atan2(dy, dx) * 180) / Math.PI
              return { key: `${stripe}-${i}`, mx: (prev.x + point.x) / 2, my: (prev.y + point.y) / 2, length, angle }
            })
          }).flat()

          return (
            <div
              key={key}
              style={{
                position: "absolute",
                left: shape.x,
                top: shape.y,
                width: shape.size,
                height: shape.height,
                transform: rotate
              }}>
              {segments.map(segment => (
                <div
                  key={segment.key}
                  style={{
                    position: "absolute",
                    left: segment.mx - segment.length / 2,
                    top: segment.my - thickness / 2,
                    width: segment.length,
                    height: thickness,
                    borderRadius: thickness / 2,
                    backgroundColor: color,
                    opacity: shape.opacity,
                    transform: `rotate(${segment.angle}deg)`
                  }}
                />
              ))}
            </div>
          )
        }

        let borderRadius: number | string = 10
        if (shape.kind === "circle") borderRadius = "50%"
        else if (shape.kind === "pill") borderRadius = shape.height / 2

        return (
          <div
            key={key}
            style={{
              position: "absolute",
              left: shape.x,
              top: shape.y,
              width: shape.size,
              height: shape.height,
              borderRadius,
              backgroundColor: color,
              opacity: shape.opacity,
              transform: rotate
            }}
          />
        )
      })}
    </div>
  )
}
