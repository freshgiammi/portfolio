import { cx } from "cva"
import type { ReactElement, ReactNode } from "react"
import { isValidElement, useCallback, useEffect, useRef } from "react"
import { flushSync } from "react-dom"
import type { Root } from "react-dom/client"
import { createRoot } from "react-dom/client"

import { getTypographyAttributes, type TypographyAttributesProps } from "@/utils/typography"

import styles from "./index.module.scss"

type ParticlesOptions = {
  /** Sideways drift, in pixels, either way from centre. Bigger type wants bigger numbers. */
  drift?: number
  /** How far up it goes before it fades. */
  rise?: number
  /** How far it turns on the way. */
  tilt?: number
  /**
   * How far each throw may stray from those three numbers, as a share of each: 0.15 wobbles a
   * throw by about a seventh either way, so a handful never flies in formation.
   */
  wander?: number
  /**
   * How big it flies. A button wants the smallest step on the scale; a heading it is thrown from
   * wants one a reader can actually catch on the way past.
   */
  size?: TypographyAttributesProps["size"]
  className?: string
}

/**
 * Irrational per-axis steps (the plastic number's powers), so successive particles never repeat a
 * direction and the two axes never line up with each other.
 */
const STEP = { drift: 0.754878, rise: 0.56984, tilt: 0.430159 }

/** Wobbles a number by a share of itself, so a throw isn't a straight line. */
const wobble = (value: number, wander: number) => value * (1 + (Math.random() - 0.5) * 2 * wander)

/**
 * Throws particles from a box without rendering them: `emit` appends a plain `<span>` that removes
 * itself on `animationend`, so a held button can fire dozens without React re-rendering once. Each
 * emission may override any of the hook's own options for that throw alone.
 */
export function useParticles({
  drift = 22,
  rise = 22,
  tilt = 24,
  wander = 0,
  size = "xxx-small",
  className
}: ParticlesOptions = {}) {
  const host = useRef<HTMLElement | null>(null)
  const cache = useRef<Drawings>(new Map())
  const thrown = useRef(0)
  const active = useRef<Set<HTMLElement>>(new Set())

  useEffect(
    () => () => {
      for (const particle of active.current) particle.remove()
      active.current.clear()
    },
    []
  )

  const emit = useCallback(
    (content: ReactNode, emission?: useParticles.Emission) => {
      const { from, options: over } = emission ?? {}
      const {
        drift: thrownDrift = drift,
        rise: thrownRise = rise,
        tilt: thrownTilt = tilt,
        wander: thrownWander = wander,
        size: thrownSize = size,
        className: thrownClassName
      } = over ?? {}
      const box = from ?? host.current
      if (!box) return

      const particle = document.createElement("span")
      particle.className = cx(styles.Particle, className, thrownClassName)
      particle.setAttribute("aria-hidden", "true")

      // Page coordinates, not viewport ones: the flight is pinned to the page so it survives a
      // scroll and isn't clipped by an ancestor's overflow or covered by a header's stacking context.
      const at = box.getBoundingClientRect()
      // The one thing taken off the box: the colour it was using, since inheritance ended when the
      // particle moved onto the page. Everything else a particle wears, its usage classes declare.
      const hue = getComputedStyle(box).color
      particle.style.cssText = `left:${at.left + at.width / 2 + window.scrollX}px;top:${at.top + at.height / 2 + window.scrollY}px;--hue:${hue}`

      for (const [name, value] of Object.entries(getTypographyAttributes({ size: thrownSize, family: "mono" }))) {
        particle.setAttribute(name, String(value))
      }

      // Stepped rather than random, so a storm never sends two particles along nearly the same line.
      // Each throw then wanders within its own share, so a handful reads as thrown, not fired.
      const n = thrown.current++
      const wanderDrift = wobble(thrownDrift, thrownWander)
      const wanderRise = wobble(thrownRise, thrownWander)
      particle.style.setProperty("--x", `${(spread(n, STEP.drift) - 0.5) * wanderDrift}px`)
      particle.style.setProperty("--y", `${-wanderRise - spread(n, STEP.rise) * (wanderRise * 0.55)}px`)
      particle.style.setProperty("--rot", `${(spread(n, STEP.tilt) - 0.5) * wobble(thrownTilt, thrownWander)}deg`)

      if (typeof content === "string" || typeof content === "number") {
        particle.textContent = String(content)
      } else {
        for (const node of drawn(cache.current, content)) particle.appendChild(node.cloneNode(true))
      }

      active.current.add(particle)
      particle.addEventListener(
        "animationend",
        () => {
          active.current.delete(particle)
          particle.remove()
        },
        { once: true }
      )
      document.body.appendChild(particle)
    },
    [drift, rise, tilt, wander, size, className]
  )

  const ref = useCallback((node: HTMLElement | null) => {
    host.current = node
  }, [])

  return { ref, emit }
}

export declare namespace useParticles {
  export type Options = ParticlesOptions

  /** One throw: where it leaves from, and any overrides of the hook's own options. */
  export type Emission = { from?: HTMLElement | null; options?: ParticlesOptions }
}

/*
 * ==========================================
 * Internals
 * ==========================================
 */

/** The nth particle's position on an axis, as a fraction, with a touch of noise so it isn't a grid. */
function spread(n: number, step: number) {
  return ((n * step) % 1) * 0.95 + Math.random() * 0.05
}

/** One drawing per kind of thing thrown, keyed by the component that draws it. */
type Drawings = Map<unknown, { props: object; nodes: Array<Node> }>

/** Caps how many distinct kinds get remembered, so a pathological emitter can't leak forever. */
const KINDS_REMEMBERED = 16

/** A single React root, reused across drawings rather than created and torn down each time. */
let board: { container: HTMLElement; root: Root } | undefined

/** The DOM for a piece of content, drawn once by React and remembered by type after that. */
function drawn(cache: Drawings, content: ReactNode): Array<Node> {
  // Only elements have a type to key on; anything else (a fragment, a list) is drawn fresh.
  const key = isValidElement(content) ? content.type : undefined
  const props = isValidElement(content) ? (content as ReactElement<object>).props : {}

  const remembered = key !== undefined ? cache.get(key) : undefined
  if (remembered && same(remembered.props, props)) return remembered.nodes

  const nodes = mounted(content)

  if (key !== undefined) {
    cache.set(key, { props, nodes })
    if (cache.size > KINDS_REMEMBERED) cache.delete(cache.keys().next().value)
  }

  return nodes
}

function mounted(content: ReactNode): Array<Node> {
  board ??= (() => {
    const container = document.createElement("span")
    return { container, root: createRoot(container) }
  })()

  flushSync(() => board!.root.render(content))
  return [...board.container.childNodes].map(node => node.cloneNode(true))
}

/** Shallow, because a particle's props are an icon's size and weight, not a tree. */
function same(a: object, b: object) {
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every(key => a[key as keyof object] === b[key as keyof object])
}
