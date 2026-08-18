import { useEffect, useRef } from "react"

import { onDataThemeChange } from "@/theme"

import styles from "./index.module.scss"

const CELL = 90
// Extra draw area so drift never reveals hard edges.
const OVERSCAN = CELL
const DRIFT_RANGE = CELL / 3

type ShapeType = "circle" | "square" | "pill" | "quarter" | "semicircle" | "line" | "triangle" | "wave"
/** Every shape is drawn in one canonical orientation, then rotated as a whole — a Truchet-tile
    approach, so quarter/triangle don't each need per-corner math. */
type Rotation = 0 | 90 | 180 | 270

type Shape = {
  x: number
  y: number
  w: number
  h: number
  type: ShapeType
  rotation: Rotation
  colorIndex: 0 | 1
  /** Multiplier on the theme's own intensity, so no two shapes read as one flat wash. */
  intensity: number
}

const ROTATIONS: Array<Rotation> = [0, 90, 180, 270]
function randomRotation(): Rotation {
  return ROTATIONS[Math.floor(Math.random() * 4)]!
}

const TYPES: Array<ShapeType> = ["circle", "square", "pill", "quarter", "semicircle", "line", "triangle", "wave"]

/** Walks forward from `candidate` in a fixed cycle until it lands on a type neither neighbour has,
    so no two adjacent cells ever share a shape type. */
function resolveType(candidate: ShapeType, neighbours: Array<ShapeType | undefined>): ShapeType {
  if (!neighbours.includes(candidate)) return candidate
  const start = TYPES.indexOf(candidate)
  for (let i = 1; i <= TYPES.length; i++) {
    const next = TYPES[(start + i) % TYPES.length]!
    if (!neighbours.includes(next)) return next
  }
  return candidate
}

/**
 * Bottom-right decorative geometric texture.
 * Layout regenerates on resize, recolors on theme change.
 */
export function GeometricBackground() {
  const frameRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layoutRef = useRef<Array<Shape>>([])
  const sizeRef = useRef({ width: 0, height: 0 })

  useEffect(() => {
    const frame = frameRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!frame || !canvas || !ctx) return undefined

    function resizeAndGenerate() {
      const dpr = window.devicePixelRatio || 1
      const frameRect = frame!.getBoundingClientRect()
      const width = frameRect.width + OVERSCAN * 2
      const height = frameRect.height + OVERSCAN * 2

      canvas!.width = width * dpr
      canvas!.height = height * dpr
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      // Draw in CSS pixels while keeping retina sharpness.
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      sizeRef.current = { width, height }
      layoutRef.current = generateLayout(width, height)
      render(ctx!, layoutRef.current, readColors(), readOpacity(frame!), sizeRef.current)
    }

    resizeAndGenerate()

    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      // Debounce layout regeneration during active window resize.
      resizeTimer = setTimeout(resizeAndGenerate, 200)
    }
    window.addEventListener("resize", onResize)
    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  // Keep shape positions stable across theme toggles: only the colours and the intensity change.
  useEffect(() => {
    const repaint = () => {
      const frame = frameRef.current
      const ctx = canvasRef.current?.getContext("2d")
      if (!frame || !ctx || layoutRef.current.length === 0) return
      render(ctx, layoutRef.current, readColors(), readOpacity(frame), sizeRef.current)
    }

    repaint()
    return onDataThemeChange(repaint)
  }, [])

  return (
    <div aria-hidden="true" className={styles.Frame} ref={frameRef}>
      <canvas
        className={styles.Canvas}
        style={{ "--overscan": `${OVERSCAN}px`, "--drift-range": `${DRIFT_RANGE}px` } as React.CSSProperties}
        ref={canvasRef}
      />
    </div>
  )
}

/*
 * ==========================================
 * Internal helpers
 * ==========================================
 */

function readColors(): [string, string] {
  const style = getComputedStyle(document.documentElement)
  const shape1 = style.getPropertyValue("--surface").trim()
  const shape2 = style.getPropertyValue("--border-subtle").trim()
  return [shape1, shape2]
}

/** The theme's own intensity, off the frame rather than the root: it belongs to this texture. */
function readOpacity(frame: HTMLDivElement): number {
  return Number.parseFloat(getComputedStyle(frame).getPropertyValue("--geometric-opacity")) || 0
}

/** Scattered either side of the theme's intensity, so the texture doesn't read as one flat wash. */
function randomIntensity(): number {
  return 0.55 + Math.random() * 0.9
}

// Roll map: <.25 circle, <.40 square, <.52 pill, <.64 quarter, <.76 semicircle, <.85 line,
// <.94 triangle, else wave. Wide pill (<.10) is decided separately below.
const THRESHOLDS: Array<[number, ShapeType]> = [
  [0.25, "circle"],
  [0.4, "square"],
  [0.52, "pill"],
  [0.64, "quarter"],
  [0.76, "semicircle"],
  [0.85, "line"],
  [0.94, "triangle"],
  [1, "wave"]
]

/** Generate one shape per grid cell (with occasional 2-cell pills) — no empty cells, fully packed,
    no two adjacent cells sharing a type. */
function generateLayout(width: number, height: number): Array<Shape> {
  // +1 keeps the far edge covered after drift and rounding.
  const cols = Math.ceil(width / CELL) + 1
  const rows = Math.ceil(height / CELL) + 1
  const gap = 5
  const consumed = new Set<string>()
  const grid = new Map<string, ShapeType>()
  const shapes: Array<Shape> = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const key = `${col},${row}`
      if (consumed.has(key)) continue

      const x = col * CELL
      const y = row * CELL
      const colorIndex: 0 | 1 = Math.random() < 0.5 ? 0 : 1
      const w = CELL - gap * 2
      const h = CELL - gap * 2
      const intensity = randomIntensity()
      const rotation = randomRotation()

      const left = grid.get(`${col - 1},${row}`)
      const up = grid.get(`${col},${row - 1}`)
      const upRight = grid.get(`${col + 1},${row - 1}`)

      const roll = Math.random()

      const canPlaceWidePill =
        roll < 0.1 &&
        col + 1 < cols &&
        !consumed.has(`${col + 1},${row}`) &&
        left !== "pill" &&
        up !== "pill" &&
        upRight !== "pill"

      if (canPlaceWidePill) {
        consumed.add(`${col + 1},${row}`)
        grid.set(key, "pill")
        grid.set(`${col + 1},${row}`, "pill")
        // Rotating this one would swing its long axis into neighbouring rows it hasn't claimed.
        shapes.push({
          x: x + gap,
          y: y + gap,
          w: CELL * 2 - gap * 2,
          h,
          type: "pill",
          rotation: 0,
          colorIndex,
          intensity
        })
        continue
      }

      const candidate = THRESHOLDS.find(([threshold]) => roll < threshold)![1]

      const type = resolveType(candidate, [left, up])
      grid.set(key, type)
      shapes.push({ x: x + gap, y: y + gap, w, h, type, rotation, colorIndex, intensity })
    }
  }

  return shapes
}

function render(
  ctx: CanvasRenderingContext2D,
  shapes: Array<Shape>,
  colors: [string, string],
  opacity: number,
  size: { width: number; height: number }
) {
  const canvasCtx = ctx
  canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height)
  for (const shape of shapes) {
    canvasCtx.globalAlpha = shape.intensity * opacity
    canvasCtx.fillStyle = colors[shape.colorIndex]
    canvasCtx.strokeStyle = colors[shape.colorIndex]
    drawShape(canvasCtx, shape)
  }
  canvasCtx.globalAlpha = 1
  applyGrain(canvasCtx, size.width, size.height)
}

const GRAIN_TILE_SIZE = 64
const GRAIN_OPACITY = 0.03
let grainTile: HTMLCanvasElement | undefined

function getGrainTile(): HTMLCanvasElement {
  if (grainTile) return grainTile

  const tile = document.createElement("canvas")
  tile.width = GRAIN_TILE_SIZE
  tile.height = GRAIN_TILE_SIZE
  const tileCtx = tile.getContext("2d")!
  const imageData = tileCtx.createImageData(GRAIN_TILE_SIZE, GRAIN_TILE_SIZE)
  for (let i = 0; i < imageData.data.length; i += 4) {
    const value = Math.floor(Math.random() * 255)
    imageData.data[i] = value
    imageData.data[i + 1] = value
    imageData.data[i + 2] = value
    imageData.data[i + 3] = 255
  }
  tileCtx.putImageData(imageData, 0, 0)

  grainTile = tile
  return tile
}

/** Painted last, over every shape, not just the empty background — so the shapes read as grainy too. */
function applyGrain(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const grainCtx = ctx
  const pattern = grainCtx.createPattern(getGrainTile(), "repeat")
  if (!pattern) return

  grainCtx.save()
  grainCtx.globalAlpha = GRAIN_OPACITY
  grainCtx.fillStyle = pattern
  grainCtx.fillRect(0, 0, width, height)
  grainCtx.restore()
}

/** Every case draws its canonical shape in local coordinates centered on the origin — the
    save/translate/rotate/restore wrapper is what actually applies each shape's rotation. */
function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  const { w, h, type, rotation } = shape

  ctx.save()
  ctx.translate(shape.x + w / 2, shape.y + h / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.beginPath()

  switch (type) {
    case "circle": {
      ctx.arc(0, 0, Math.min(w, h) / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.fill()
      break
    }
    case "square": {
      ctx.roundRect(-w / 2, -h / 2, w, h, 10)
      ctx.closePath()
      ctx.fill()
      break
    }
    case "pill": {
      ctx.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) / 2)
      ctx.closePath()
      ctx.fill()
      break
    }
    case "quarter": {
      // Canonical corner: anchored top-left, sweeping into the cell. Rotation covers the rest.
      const r = Math.min(w, h)
      ctx.moveTo(-w / 2, -h / 2)
      ctx.arc(-w / 2, -h / 2, r, 0, Math.PI / 2)
      ctx.closePath()
      ctx.fill()
      break
    }
    case "semicircle": {
      // Mirrored pair: flat sides on the cell's outer edges, both bulges meeting at the centre.
      const r = Math.min(w, h) / 2
      ctx.arc(-w / 2, 0, r, -Math.PI / 2, Math.PI / 2)
      ctx.closePath()
      ctx.moveTo(w / 2, r)
      ctx.arc(w / 2, 0, r, Math.PI / 2, Math.PI * 1.5)
      ctx.closePath()
      ctx.fill()
      break
    }
    case "triangle": {
      // Canonical right angle at the top-left corner.
      ctx.moveTo(-w / 2, -h / 2)
      ctx.lineTo(w / 2, -h / 2)
      ctx.lineTo(-w / 2, h / 2)
      ctx.closePath()
      ctx.fill()
      break
    }
    case "line": {
      // A stack of evenly-spaced ruled stripes, not one bar — canonical horizontal, rotation
      // covers the vertical case.
      const stripeCount = 5
      const spacing = h / stripeCount
      const thickness = spacing * 0.45
      for (let i = 0; i < stripeCount; i++) {
        const yy = -h / 2 + spacing * (i + 0.5) - thickness / 2
        ctx.roundRect(-w / 2, yy, w, thickness, thickness / 2)
      }
      ctx.closePath()
      ctx.fill()
      break
    }
    case "wave": {
      // Same stripe rhythm as `line`, but each stripe is a zigzag stroke.
      const stripeCount = 5
      const spacing = h / stripeCount
      const thickness = spacing * 0.45
      const amplitude = spacing * 0.35
      const segmentCount = 8
      const step = w / segmentCount

      const waveCtx = ctx
      waveCtx.lineWidth = thickness
      waveCtx.lineCap = "round"
      waveCtx.lineJoin = "round"

      for (let i = 0; i < stripeCount; i++) {
        const baseline = -h / 2 + spacing * (i + 0.5)
        waveCtx.beginPath()
        waveCtx.moveTo(-w / 2, baseline)
        for (let segment = 1; segment <= segmentCount; segment++) {
          const xx = -w / 2 + step * segment
          const yy = baseline + (segment % 2 === 0 ? -amplitude : amplitude)
          waveCtx.lineTo(xx, yy)
        }
        waveCtx.stroke()
      }
      break
    }
  }

  ctx.restore()
}
