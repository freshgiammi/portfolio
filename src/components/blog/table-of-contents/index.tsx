import { Collapsible } from "@base-ui/react/collapsible"
import { useEffect, useRef, useState } from "react"

import { Icon } from "@/components/ui/icons"
import { Typography } from "@/components/ui/typography"
import type { MarkdownHeading } from "@/utils/markdown"

import styles from "./index.module.scss"

type TableOfContentsProps = {
  headings: Array<MarkdownHeading>
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const activeId = useActiveHeading(headings)
  const listRef = useRef<HTMLUListElement>(null)

  useKeepActiveInView(listRef, activeId)

  if (headings.length === 0) return null

  return (
    <nav className={styles.Toc} aria-label="On this page">
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger className={styles.Toc__trigger}>
          <Typography size="xx-small" weight="semibold" render={<span />} className={styles.Toc__label}>
            On this page
          </Typography>
          <Icon.CaretDownIcon size={14} weight="bold" className={styles.Toc__caret} />
        </Collapsible.Trigger>

        <Collapsible.Panel className={styles.Toc__panel}>
          {/* One continuous rail with a single accent thumb, rather than a border per item: a rule
              on every heading was what made the sidebar read as a ladder. */}
          <ul className={styles.Toc__list} ref={listRef}>
            {headings.map(heading => (
              <li key={heading.id}>
                <Typography
                  size="x-small"
                  className={styles.Toc__link}
                  render={
                    <a
                      href={`#${heading.id}`}
                      style={{ paddingLeft: `${0.75 + (heading.level - 1) * 0.75}rem` }}
                      data-active={heading.id === activeId || undefined}
                      onClick={event => {
                        event.preventDefault()
                        // Smoothness comes from the global CSS `scroll-behavior`; the JS option
                        // silently no-ops on iOS Safari.
                        document.getElementById(heading.id)?.scrollIntoView()
                      }}
                    />
                  }>
                  {heading.text}
                </Typography>
              </li>
            ))}
          </ul>
        </Collapsible.Panel>
      </Collapsible.Root>
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

/** Scrolls the list, not the page: the list is the scroll container the active link sits in. */
function useKeepActiveInView(listRef: React.RefObject<HTMLUListElement | null>, activeId: string) {
  useEffect(() => {
    if (!activeId) return
    const list = listRef.current
    if (!list) return

    const link = list.querySelector(`a[href="#${activeId}"]`)
    if (!link) return

    list.classList.add("toc-hide-scrollbar")
    list.style.scrollbarWidth = "none"
    link.scrollIntoView({ block: "nearest" })
    requestAnimationFrame(() => {
      list.classList.remove("toc-hide-scrollbar")
      list.style.scrollbarWidth = ""
    })
  }, [listRef, activeId])
}

function useActiveHeading(headings: Array<MarkdownHeading>): string {
  const [activeId, setActiveId] = useState<string>("")
  const visibleRef = useRef(new Set<string>())

  useEffect(() => {
    const visible = visibleRef.current
    visible.clear()

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            visible.add(entry.target.id)
          } else {
            visible.delete(entry.target.id)
          }
        })

        const firstVisible = headings.find(h => visible.has(h.id))
        if (firstVisible) {
          setActiveId(firstVisible.id)
        }
      },
      {
        rootMargin: "-80px 0px -65% 0px"
      }
    )

    const elements: Array<HTMLElement> = []
    headings.forEach(h => {
      const el = document.getElementById(h.id)
      if (el) {
        elements.push(el)
        observer.observe(el)
      }
    })

    return () => {
      elements.forEach(el => observer.unobserve(el))
    }
  }, [headings])

  return activeId
}
