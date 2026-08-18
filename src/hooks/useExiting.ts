import type { AnimationEvent } from "react"
import { useEffect, useState } from "react"

/**
 * Keeps items that were removed from `items` rendered for one more beat, so their exit animation
 * can finish before they truly unmount. Returns the dropped-but-still-lingering items; render
 * them alongside the live ones (keyed apart from the live list), start their CSS animation on
 * mount, and hand each one an event handler from `exitHandlerFor` — the `animationend` bubbling
 * off an exiting item then retires exactly that item, so its unmount tracks the animation's real
 * finish (delays included) rather than a guessed duration.
 *
 * Lingering items are derived synchronously during render, so they mount in the same commit that
 * removed their live twins — no frame goes by where the item is missing. The risk with trusting
 * every drop is churn: sources behind route transitions can commit non-atomically and briefly
 * hand back stale lists, faking drops that never happened. Those are caught by recency: every
 * list change arms a guard for `churnWindowMs`, and a drop seen while the guard is up is treated
 * as churn and spawns nothing — a drop after a quiet period (every real navigation) is believed
 * instantly.
 *
 * A fallback timer retires any item whose `animationend` never arrives — a global
 * `prefers-reduced-motion: reduce` rule typically switches animations off entirely — so nothing
 * can outlive `fallbackMs`.
 *
 * @example
 * ```tsx
 * const { exiting, exitHandlerFor } = useExiting(crumbs, crumb => crumb.href)
 *
 * exiting.map(crumb => (
 *   <li key={`exiting-${crumb.href}`} data-exiting onAnimationEnd={exitHandlerFor(crumb)}>…</li>
 * ))
 * ```
 */
export function useExiting<T>(
  items: Array<T>,
  getKey: (item: T) => string,
  { churnWindowMs = 100, fallbackMs = 1000 }: { churnWindowMs?: number; fallbackMs?: number } = {}
): {
  exiting: Array<T>
  exitHandlerFor: (item: T) => (event: AnimationEvent<HTMLElement>) => void
} {
  const [settledItems, setSettledItems] = useState(items)
  const [exiting, setExiting] = useState<Array<T>>([])
  const [churnGuarded, setChurnGuarded] = useState(false)
  const [changeCount, setChangeCount] = useState(0)

  const currentKeys = new Set(items.map(getKey))
  const settledKeys = settledItems.map(getKey)
  if (settledKeys.length !== items.length || items.some((item, index) => getKey(item) !== settledKeys[index])) {
    const dropped = settledItems.filter(item => !currentKeys.has(getKey(item)))
    setSettledItems(items)
    // Ghosts exist to fill the hole a shrinking list leaves behind. A same-length change is a
    // swap, not an exit: an outgoing ghost beside its replacement reads as a duplicate and
    // doubles the animation, so swaps are covered by the fresh item's entrance alone.
    const shrinking = items.length < settledKeys.length
    setExiting(churnGuarded || !shrinking || dropped.length === 0 ? [] : dropped)
    setChurnGuarded(true)
    setChangeCount(count => count + 1)
  }

  // Disarm the churn guard once the list has stayed put for a full window.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (changeCount > 0) setChurnGuarded(false)
    }, churnWindowMs)
    return () => window.clearTimeout(timer)
  }, [changeCount, churnWindowMs])

  // Backstop: retire items whose animation never ends (motion disabled, display toggled, …).
  useEffect(() => {
    let cancel: (() => void) | undefined
    if (exiting.length > 0) {
      const timer = window.setTimeout(() => setExiting([]), fallbackMs)
      cancel = () => window.clearTimeout(timer)
    }
    return cancel
  }, [exiting, fallbackMs])

  const exitHandlerFor = (item: T) => (event: AnimationEvent<HTMLElement>) => {
    // Children can run animations of their own; only the exiting element's own finishing counts.
    if (event.target !== event.currentTarget) return
    setExiting(current => current.filter(present => getKey(present) !== getKey(item)))
  }

  // An exiting item whose twin came back is simply the item again — never render both.
  return { exiting: exiting.filter(item => !currentKeys.has(getKey(item))), exitHandlerFor }
}
