import { cx } from "cva"
import type { ComponentProps } from "react"
import { useEffect, useRef, useState } from "react"

import { Scrollable } from "@/components/primitives/scrollable"
import { Typography } from "@/components/primitives/typography"
import { useScrollToHeading } from "@/hooks/useScrollToHeading"
import type { MarkdownHeading } from "@/utils/markdown"
import { scrollBehavior } from "@/utils/scroll"

import styles from "./index.module.scss"

type TableOfContentsProps = ComponentProps<"nav"> & {
  headings: Array<MarkdownHeading>
}

/** Shorter than the `Scrollable` default: the post rail sits under this in the same sticky column. */
const MAX_HEIGHT = 340

export function TableOfContents({ headings, className, ...rest }: TableOfContentsProps) {
  const { activeId, handleLinkClick } = useActiveHeading(headings)
  const activeIndex = headings.findIndex(heading => heading.id === activeId)
  const scrollRef = useRef<HTMLDivElement>(null)

  useKeepActiveInView(scrollRef, activeId)

  if (headings.length === 0) return null

  return (
    <nav aria-label="On this page" {...rest} className={cx(styles.Toc, className)}>
      <Typography size="xx-small" weight="semibold" render={<span />} className={styles.Toc__label}>
        On this page
      </Typography>

      <Scrollable
        scrollbar="hover"
        maxHeight={MAX_HEIGHT}
        contentClassName={styles.Toc__scrollContent}
        contentRef={scrollRef}>
        <ul className={styles.Toc__list}>
          {headings.map((heading, index) => {
            const isActive = heading.id === activeId
            const isPast = activeIndex >= 0 && index < activeIndex

            let state: "active" | "past" | undefined
            if (isActive) state = "active"
            else if (isPast) state = "past"

            return (
              <li key={heading.id}>
                <Typography
                  size="xx-small"
                  className={styles.Toc__link}
                  render={
                    <a
                      href={`#${heading.id}`}
                      style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
                      data-state={state}
                      onClick={event => {
                        event.preventDefault()
                        handleLinkClick(heading.id)
                      }}
                    />
                  }>
                  <span className={styles.Toc__index}>{String(index + 1).padStart(2, "0")}.</span>
                  <span className={styles.Toc__text}>{heading.text}</span>
                </Typography>
              </li>
            )
          })}
        </ul>
      </Scrollable>
    </nav>
  )
}

export declare namespace TableOfContents {
  export type Props = TableOfContentsProps
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

/** Scrolls the list, not the page: `scrollRef` is `Scrollable`'s own scrolling element, handed
 *  back via its `contentRef` prop rather than found by walking the DOM from the `ul`. */
function useKeepActiveInView(scrollRef: React.RefObject<HTMLDivElement | null>, activeId: string) {
  useEffect(() => {
    if (!activeId) return
    const list = scrollRef.current
    if (!list) return

    const link = list.querySelector(`a[href="#${activeId}"]`)
    if (!link) return

    // scrollIntoView would walk up to the page as a scrollable ancestor when the link can't be fully
    // centred within the list alone. scrollBy also avoids a react-compiler immutability warning that
    // a direct scrollTop write on this ref-derived list would trip.
    const listRect = list.getBoundingClientRect()
    const linkRect = link.getBoundingClientRect()
    const offset = linkRect.top + linkRect.height / 2 - (listRect.top + listRect.height / 2)
    list.scrollBy({ top: offset, behavior: scrollBehavior() })
  }, [scrollRef, activeId])
}

/** Where a heading has to cross to count as "current" — close enough to the fixed header that a
    reader would call this the section they're in, not "the next one, coming up." Feeds the
    observer's `rootMargin` as the top edge of the activation band. */
const ACTIVE_THRESHOLD = 100

/** The last heading, in document order, marked as having crossed the threshold. Headings can sit
    more than a viewport apart, so there's never a gap where none of them match: unset falls back to
    the first heading. */
function pickActiveId(headings: Array<MarkdownHeading>, passed: Map<string, boolean>): string {
  let current: string | undefined
  for (const heading of headings) {
    if (passed.get(heading.id)) current = heading.id
  }
  return current ?? headings[0]?.id ?? ""
}

function useActiveHeading(headings: Array<MarkdownHeading>) {
  // "" here, not a position/hash read: doing that during render would make the first client render
  // disagree with the server's, and hydration doesn't reliably patch a `data-state` mismatch that
  // causes. Corrected for real by the observer's own initial report below instead.
  const [activeId, setActiveId] = useState<string>("")
  const isClickScrollingRef = useRef(false)
  const scrollToHeading = useScrollToHeading()

  useEffect(() => {
    if (headings.length === 0) return undefined

    const passed = new Map<string, boolean>()

    // A thin band around ACTIVE_THRESHOLD would miss a heading that crosses it entirely between two
    // scroll ticks, leaving that heading's last-known state stale. Growing the root far upward
    // instead means "intersecting" directly means "top <= ACTIVE_THRESHOLD, however long ago it got
    // there" — a heading can't cross that huge a margin unnoticed, so there's nothing left to go stale.
    const observer = new IntersectionObserver(
      entries => {
        // Ignore, don't just skip the setState: a click-scroll is already mid-flight to its target,
        // and applying whatever transient state the browser reports on the way there would fight it.
        if (isClickScrollingRef.current) return

        for (const entry of entries) passed.set(entry.target.id, entry.isIntersecting)

        setActiveId(pickActiveId(headings, passed))
      },
      { rootMargin: `100000px 0px -${window.innerHeight - ACTIVE_THRESHOLD}px 0px` }
    )

    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  const handleLinkClick = (id: string) => {
    setActiveId(id)
    scrollToHeading(id)
    suppressAutoActiveFor(value => {
      isClickScrollingRef.current = value
    }, 1000)
  }

  return { activeId, handleLinkClick }
}

/** Holds off the observer's own guess at the active heading, for whichever comes first: the
    scroll this suppression was covering for finishing, or the timeout as a fallback in case it
    never fires (nothing to scroll, or the browser's own jump doesn't emit one). Takes a setter
    rather than the ref itself, so it never has to mutate a parameter's own property directly. */
function suppressAutoActiveFor(setSuppressed: (value: boolean) => void, ms: number) {
  setSuppressed(true)

  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined

  const cleanup = () => {
    setSuppressed(false)
    window.removeEventListener("scrollend", cleanup)
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }

  timeoutId = setTimeout(cleanup, ms)
  window.addEventListener("scrollend", cleanup, { once: true })
}
