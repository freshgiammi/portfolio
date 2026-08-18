import { cx } from "cva"
import { useCallback, useEffect, useRef } from "react"

import styles from "./index.module.scss"

type ConfettiOptions = {
  /** How many pieces go up. */
  pieces?: number
  /** How far a piece gets, in pixels, before gravity wins. */
  distance?: number
  /** A popper opens on all sides at once; a cannon fires a cone in the direction it's aimed. */
  spray?: "popper" | "cannon"
  /** Degrees clockwise from straight up. Ignored by a popper. */
  aim?: number
  /** Width of a cannon's cone, in degrees. Ignored by a popper. */
  cone?: number
  className?: string
}

/** Somewhere on the page for a burst to come from, when there is no element to take it from. */
type Point = { x: number; y: number }

/** How far a piece may stray from its slot, as a share of that slot. Under 1, so slots never swap. */
const WANDER = 0.9

/** Zero degrees points along the x axis; a cannon's own zero is straight up. */
const UP = -90

/** Upward shove every popper piece gets, as a share of distance, added to its own direction. */
const LIFT = 0.75

/**
 * Fires a burst of confetti from a box, or a point, without rendering anything: same shape as
 * `useParticles`, for the same reason. Defaults set on the hook can be overridden per call.
 */
export function useConfetti(defaults: ConfettiOptions = {}) {
  const {
    pieces: defaultPieces = 21,
    distance: defaultDistance = 85,
    spray: defaultSpray = "popper",
    aim: defaultAim = 0,
    cone: defaultCone = 60,
    className: defaultClassName
  } = defaults

  const host = useRef<HTMLElement | null>(null)
  const active = useRef<Set<HTMLElement>>(new Set())

  useEffect(
    () => () => {
      for (const spray of active.current) spray.remove()
      active.current.clear()
    },
    []
  )

  const burst = useCallback(
    (from?: HTMLElement | Point | null, options: ConfettiOptions = {}) => {
      const origin = from ?? host.current
      if (!origin) return

      const pieces = options.pieces ?? defaultPieces
      const distance = options.distance ?? defaultDistance
      const shape = options.spray ?? defaultSpray
      const aim = options.aim ?? defaultAim
      const cone = options.cone ?? defaultCone
      const className = options.className ?? defaultClassName

      const spray = document.createElement("span")
      spray.className = cx(styles.Confetti, className)
      spray.setAttribute("aria-hidden", "true")

      // Page coordinates, not viewport ones: the burst is pinned to the page so it survives a scroll
      // and isn't clipped by an ancestor's overflow or covered by a header's stacking context.
      const at = origin instanceof Element ? origin.getBoundingClientRect() : undefined
      const x0 = at ? at.left + at.width / 2 + window.scrollX : (origin as Point).x
      const y0 = at ? at.top + at.height / 2 + window.scrollY : (origin as Point).y
      spray.style.cssText = `left:${x0}px;top:${y0}px`

      // Each piece gets a slot of the arc and wanders inside it, which covers the arc evenly without
      // reading as a diagram of evenly-spaced dots.
      const arc = shape === "popper" ? 360 : cone
      const start = shape === "popper" ? 0 : UP + aim - cone / 2
      const slot = arc / pieces

      const blank = document.createElement("span")
      const lift = shape === "popper" ? LIFT * distance : 0

      for (let index = 0; index < pieces; index++) {
        const degrees = start + (index + (Math.random() - 0.5) * WANDER) * slot
        const reach = distance * (0.82 + Math.random() * 0.36)

        const radians = (degrees * Math.PI) / 180
        const x = Math.cos(radians) * reach
        const y = Math.sin(radians) * reach - lift

        const piece = blank.cloneNode(false) as HTMLElement
        // One write, not five: each `setProperty` is its own parse and invalidation.
        piece.style.cssText =
          `--angle:${(Math.atan2(y, x) * 180) / Math.PI}deg;` +
          `--distance:${Math.sqrt(x * x + y * y)}px;` +
          `--fall:${distance * (0.6 + Math.random() * 0.35)}px;` +
          `--spin:${(Math.random() - 0.5) * 540}deg;` +
          `--delay:${Math.random() * 90}ms`
        spray.appendChild(piece)
      }

      let landed = 0
      active.current.add(spray)
      spray.addEventListener("animationend", () => {
        landed += 1
        if (landed === pieces) {
          active.current.delete(spray)
          spray.remove()
        }
      })

      document.body.appendChild(spray)
    },
    [defaultPieces, defaultDistance, defaultSpray, defaultAim, defaultCone, defaultClassName]
  )

  const ref = useCallback((node: HTMLElement | null) => {
    host.current = node
  }, [])

  return { ref, burst }
}

export declare namespace useConfetti {
  export type Options = ConfettiOptions
}
