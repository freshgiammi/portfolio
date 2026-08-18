import type { RefObject } from "react"
import { useEffect, useState } from "react"

/**
 * A band across the middle of the screen, as `rootMargin`. One tall enough to hold a single item is
 * a feed reading itself out one entry at a time; one tall enough to hold a whole group lets that
 * group speak while it is on screen and go quiet once it is not.
 */
export const REVEAL_BAND = {
  /** About a fifth of the screen: one item at a time, for a list you scroll through. */
  item: "-40% 0px -40% 0px",
  /** About three fifths: enough for a small group to arrive and stay, for a section you pass. */
  group: "-20% 0px -20% 0px"
} as const

/**
 * Whether something should be showing what a hover would have shown.
 *
 * A touch screen has no hover to give, and on a link the only other way to reach it is to open the
 * link, which is the one outcome a reader browsing a page of them did not ask for. So where there is
 * no pointer, the answer is where the element is: it speaks while it is what you are looking at.
 *
 * Nothing is observed where a pointer can hover, so this costs a media query and no more on a
 * desktop.
 */
export function useRevealedWithoutHover(ref: RefObject<HTMLElement | null>, band: string = REVEAL_BAND.item) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const element = ref.current
    // A pointer that can hover already has every word of this, on demand and one element at a time.
    if (!element || window.matchMedia("(hover: hover)").matches) return undefined

    const observer = new IntersectionObserver(([entry]) => setRevealed(entry?.isIntersecting ?? false), {
      rootMargin: band
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, band])

  return revealed
}
