import { useNavigate } from "@tanstack/react-router"

import { scrollBehavior } from "@/utils/scroll"

/** Roughly the fixed header's own height: a heading tucked just behind it doesn't count as
    visible, even though its box technically overlaps the viewport. */
const HEADER_ALLOWANCE = 80

/** How long to keep correcting the scroll position against layout shift after a click. A lazy
    image below the target that has not loaded yet (a clean cache, mainly) still reserves no space
    at click time on this site's intrinsic-layout images, so it can grow the page and leave the
    target short of where the initial `scrollIntoView` put it. */
const CORRECTION_WINDOW_MS = 1000

/**
 * Navigates to `#id` the same as a native anchor click would (the address bar reflects it, the
 * back button undoes it), and scrolls it into view only if no part of it is already visible.
 *
 * The scroll decision is made here, not handed to the router's own `hashScrollIntoView`: clicking
 * the same hash twice in a row resolves to the same location, and the router short-circuits that
 * case by skipping the step that would record a new `hashScrollIntoView` value at all, leaving
 * whatever the *first* click stored still in effect. `hashScrollIntoView` is always `false` here
 * so the router never scrolls on its own regardless of which click wrote it, and this hook does
 * the actual `scrollIntoView` itself, synchronously, off its own fresh read of the DOM.
 */
export function useScrollToHeading() {
  const navigate = useNavigate()

  return (id: string) => {
    const el = document.getElementById(id)
    const rect = el?.getBoundingClientRect()
    const alreadyInView = rect ? rect.bottom > HEADER_ALLOWANCE && rect.top < window.innerHeight : false

    void navigate({ hash: id, hashScrollIntoView: false, resetScroll: false })
    if (!alreadyInView && el) scrollWithCorrection(el)
  }
}

/**
 * `scrollIntoView` once, then keeps re-issuing it while the document keeps resizing underneath —
 * content above or at the target settling into its final, lazily-loaded size — for a short window.
 * A `wheel`/`touchmove` cancels it early: past that point the reader is scrolling on purpose, and a
 * correction fighting them back to the heading would be the more annoying bug.
 *
 * The corrections snap rather than animate: several images settling in one after another would
 * otherwise restart a smooth scroll mid-flight each time, which reads as a stutter rather than the
 * one clean scroll a reader expects from a click.
 */
function scrollWithCorrection(el: HTMLElement) {
  el.scrollIntoView({ behavior: scrollBehavior() })

  const resizeObserver = new ResizeObserver(() => el.scrollIntoView({ behavior: "instant" }))
  resizeObserver.observe(document.body)

  const timeoutId = setTimeout(stop, CORRECTION_WINDOW_MS)

  function stop() {
    resizeObserver.disconnect()
    window.removeEventListener("wheel", stop)
    window.removeEventListener("touchmove", stop)
    clearTimeout(timeoutId)
  }

  window.addEventListener("wheel", stop, { once: true, passive: true })
  window.addEventListener("touchmove", stop, { once: true, passive: true })
}
